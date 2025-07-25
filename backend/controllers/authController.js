const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { signUpSchema, signInSchema } = require('../zodSchema/user')
const transporter = require('../config/nodemailer')

const prisma = require('../prismaInstance')


const signUp = async (req, res) => {
  const response = signUpSchema.safeParse(req.body)
  if (!response.success) {
    return res.status(422).json({
      error: 'Invalid Inputs',
      details: response.error.format()
    })
  }

  const { name, email, password } = response.data;

  const existingUser = await prisma.user.findFirst({
    where: { email }
  })
  if (existingUser) {
    return res.status(409).json({
      error: 'Email already taken'
    })
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword
      }
    })

    const verificationCode = (Math.floor(100000 + Math.random() * 900000)).toString()

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationCodeExpiresIn: new Date(Date.now() + 10 * 60 * 1000)
      },
    });

    const mailOptions = {
      from: `Finance Buddy <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Verification Email',
      text: `Here is your verification code ${verificationCode} to verify your email. Verification Code will expire in 10 minutes`
    };

    await transporter.sendMail(mailOptions)

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })

    res.status(201).json({
      user,
      token,
      message: 'Verification Code sent to your email address.'
    })
  } catch (error) {
    console.error('Signup  error', error)
    res.status(400).json({
      error: 'Failed to sign up'
    })
  }
}

const signIn = async (req, res) => {
  const response = signInSchema.safeParse(req.body);
  if (!response.success) {
    return res.status(422).json({
      error: 'Invalid inputs',
      details: response.error.format()
    })
  }

  const { email, password } = response.data;

  const user = await prisma.user.findFirst({
    where: { email }
  })

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    })
  }
  else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

const checkAuth = async (req, res) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userInfo = await prisma.user.findFirst({
      where: { id: userId }
    })

    if (!userInfo) {
      return res.status(404).json({
        error: 'User not found'
      })
    }
    res.json({
      success: true,
      userData: {
        name: userInfo.name,
        email: userInfo.email,
        isVerified: userInfo.isVerified
      }
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const isAuthenticated = async (req, res) => {
  try {
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

const verifyEmail = async (req, res) => {
  const { userId } = req;
  const { verificationCode } = req.body;

  if (!userId || !verificationCode) {
    return res.json({ success: false, message: 'Verification code required or unauthorized' })
  }

  try {

    const user = await prisma.user.findFirst({ where: { id: userId } })
    if (!user) {
      return res.json({ success: false, message: 'user not found' })
    }

    if (user.verificationCode === '' || user.verificationCode !== verificationCode) {
      return res.json({ success: false, message: 'Invalid verification code' })
    }

    if (user.verificationCodeExpiresIn < Date.now()) {
      return res.json({ success: false, message: 'Verification Code expired' })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: '',
        verificationCodeExpiresIn: new Date(Date.now()),
        isVerified: true
      },
    });

    res.json({ success: true, message: 'Signed up successfully' })

  } catch (error) {
    res.json({ success: false, error: error.message })
  }
}

const sendResetVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: 'Email required' })
  }

  try {
    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
      res.json({ success: false, message: 'User not found' })
    }
    const resetVerificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordCode: resetVerificationCode,
        resetPasswordCodeExpiresIn: new Date(Date.now() + 5 * 60 * 1000)
      }
    })

    const mailOption = {
      from: `Finance Buddy <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Verification Email',
      text: `Here is your password reset verification code ${resetVerificationCode} to verify your email. Verification Code will expire in 5 minutes`
    }

    await transporter.sendMail(mailOption)

    res.json({ success: true, message: 'Verification Code sent to your email' })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
}

const resetPassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
    return res.json({ success: false, message: 'Missing details' })
  }

  try {
    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }
    if (user.resetPasswordCode === '' || user.resetPasswordCode !== verificationCode) {
      return res.json({ success: false, message: 'Invalid verification code' })
    }

    if (user.resetPasswordCodeExpiresIn < Date.now()) {
      return res.json({ success: false, message: 'Verification Code expired' })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordCode: '',
        resetPasswordCodeExpiresIn: new Date(Date.now()),
        passwordHash: hashedNewPassword
      }
    })

    res.json({ success: true, message: 'Password has been reset successfully' })

  } catch (error) {
    res.json({ success: false, error: error.message })
  }
}


module.exports = {
  signIn,
  signUp,
  checkAuth,
  isAuthenticated,
  verifyEmail,
  sendResetVerificationCode,
  resetPassword
}