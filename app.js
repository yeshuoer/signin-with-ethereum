const path = require('path')
const express = require('express')
const ethers = require('ethers')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

//假设这是后台的数据库，users表里保存了user对象，user对象包含用户的地址和关联的nonce
//{"address": 用户地址, "nonce": 返回给前端的随机数nonce}
const users = {}

/**
 * 通过地址获取后端生成的随机数 nonce，用于签名
 * @param address  用户地址
 * @returns {number} 返回随机数 nonce
 *
 * 这个方法充当后台服务，从后台中获取需要签名的数据
 */
function auth(address) {
  let user = users[address]
  if (!user) {
    user = {
      address,
      nonce: Math.floor(Math.random() * 10000000)
    }
    users[address] = user
  } else {
    const nonce = Math.floor(Math.random() * 10000000)
    user.nonce = nonce
    users[address] = user
  }
  console.log('users', users)
  return user.nonce
}

/**
 * 验证用户签名是否正确
 * @param address   用户地址
 * @param signature 签名数据
 * @returns {boolean} 返回签名是否正确
 *
 * 这个方法充当后台服务，后台验证签名正确后，就返回相关登录态数据，完成登录流程
 */
function verify(address, signature) {
  let signValid = false
  console.log(`address: ${address}`)
  //从数据库中取出nonce
  let nonce = users[address].nonce
  console.log(`nonce: ${nonce}`)
  //验证对nonce进行签名的地址
  const decodedAddress = ethers.verifyMessage(nonce.toString(), signature.toString())
  console.log(`decodedAddress: ${decodedAddress}`)
  //比较地址和签名的地址是否一致
  if (address.toLowerCase() === decodedAddress.toLowerCase()) {
    signValid = true
    //出于安全原因，更改nonce，防止下次直接使用相同的nonce进行登录
    users[address].nonce = Math.floor(Math.random() * 10000000)
  }
  return signValid
}

app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/auth', (req, res) => {
  const address = req.query.account
  const nonce = auth(address)
  res.send({
    address,
    nonce
  })
})

app.get('/verify', (req, res) => {
  const address = req.query.address
  const signature = req.query.signature
  const signValid = verify(address, signature)
  res.send({
    address,
    signValid
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
