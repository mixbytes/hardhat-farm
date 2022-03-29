const { expect } = require("chai");

describe("Proxy test", function () {

  let Token;
  let Proxy;
  let token1;
  let proxy1;
  
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    Token = await ethers.getContractFactory("EvilToken");
    Proxy = await ethers.getContractFactory("Proxy");
    
    token1 = await Token.deploy();
    await token1.deployed();
    proxy1 = await Proxy.deploy(token1.address);
    await proxy1.deployed();
  });


  describe("Proxy storage", function () {
    it("Proxy storage", async function () {
      const token = await Token.attach(proxy1.address);

      let ownerBalance = await token.balanceOf(owner.address);
      console.log("Owner %s has %s tokens (WTF????? Constructor was called???)", owner.address, ownerBalance);
      
      await token.init();
      ownerBalance = await token.balanceOf(owner.address);
      //console.log("Owner %s has %s tokens", owner.address, ownerBalance);
    });
  });

  describe("Clash", function () {
    it("Clash", async function () {
      const token = await Token.attach(proxy1.address);
      await token.init();
      
      let ownerBalance = await token.balanceOf(owner.address);
      ownerBalance = await token.balanceOf(owner.address);
      console.log("Owner %s has %s tokens", owner.address, ownerBalance);
      expect(ownerBalance).to.equal(100);

      // mints +666 tokens to owner!
      await token.proxyOwner();
      
      ownerBalance = await token.balanceOf(owner.address);
      console.log("Owner %s has %s tokens", owner.address, ownerBalance);
      expect(ownerBalance).to.equal(766);
    });
  });


});
