const zod = require('zod')

const signUpSchema = zod.object({
  name: zod.string().min(1,'Enter your name'),
  email: zod.string().email(),
  password: zod.string().min(6 , 'password should contain atleast 6 characters')
})

const signInSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6 , 'password should contain atleast 6 characters')
})

module.exports = {
  signUpSchema ,
  signInSchema
}