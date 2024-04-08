import {ethers} from "https://cdn.jsdelivr.net/npm/ethers@6.11.1/dist/ethers.min.js";
const signButton = document.querySelector('.sign');
const showAccount = document.querySelector('.showAccount');
const showNonce = document.querySelector('.showNonce');
const showSignature = document.querySelector('.showSignature');
const showSignStatus = document.querySelector('.showSignStatus');

// 前端签名流程
async function onClickHandler() {
  console.log("连接钱包")
  // 获得provider
  const provider = new ethers.BrowserProvider(window.ethereum)
  // 读取钱包地址
  const accounts = await provider.send("eth_requestAccounts", []);
  const account = accounts[0]
  console.log(`钱包地址: ${account}`)
  showAccount.innerHTML = account;

  //从后台获取需要进行签名的数据
  const nonce = (await (await fetch(`/auth?account=${account}`)).json()).nonce
  console.log('nouce', nonce)
  showNonce.innerHTML = nonce;
  console.log(`获取后台需要签名的数据: ${nonce}`)
  //签名
  const signer = await provider.getSigner()
  const signature = await signer.signMessage(nonce.toString())
  showSignature.innerHTML = signature;
  //去后台验证签名，完成登录
  const signStatus = (await (await fetch(`/verify?address=${account}&signature=${signature}`)).json()).signValid
  showSignStatus.innerHTML = signStatus;
}

signButton.addEventListener(`click`, onClickHandler)
