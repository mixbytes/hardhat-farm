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
    
    TokenFactory = await ethers.getContractFactory("TokenFactory");
    FactoryToken = await ethers.getContractFactory("FactoryToken");
    tokenFactory = await TokenFactory.deploy();
    await tokenFactory.deployed();
    console.log("Factory  address  is: %s", tokenFactory.address);
    console.log("Owner(my) address is: %s\n", owner.address);
  });


  describe("Deploy two tokens", function () {
    it("Deploy two tokens", async function () {
      let addresses;
      let ownerBalance1;
      let ownerBalance2;
      let ownerBalance3;
      let ownerBalance4;

      let tx = await tokenFactory.createDummy();
      let receipt = await tx.wait();
      console.log("...create dummy action (gas spent: %s)...\n\n", receipt.gasUsed);

      // deploy first token
      tx = await tokenFactory.createFactoryToken(100);
      receipt = await tx.wait();
      addresses = await tokenFactory.getFactoryTokens();
      const token1 = await FactoryToken.attach(addresses[0]);
      ownerBalance1 = await token1.balanceOf(tokenFactory.address);
      console.log("(NEW) Created 1st token, ADDR: %s owner balance: %s gas: %s\n", addresses[0], ownerBalance1, receipt.gasUsed);

      await tokenFactory.createDummy(); console.log("...dummy action...");
      await tokenFactory.createDummy(); console.log("...dummy action...");
      await tokenFactory.createDummy(); console.log("...dummy action...");
      console.log("\n");

      tx = await tokenFactory.createFactoryToken(500);
      receipt = await tx.wait();
      addresses = await tokenFactory.getFactoryTokens();
      const token2 = await FactoryToken.attach(addresses[1]);
      ownerBalance2 = await token2.balanceOf(tokenFactory.address);
      console.log("(NEW) Created 2nd token, ADDR: %s owner balance: %s gas: %s\n", addresses[1], ownerBalance2, receipt.gasUsed);


      tx = await tokenFactory.create2FactoryToken(666);
      receipt = await tx.wait();
      addresses = await tokenFactory.getFactoryTokens();
      const token3 = await FactoryToken.attach(addresses[2]);
      ownerBalance3 = await token3.balanceOf(tokenFactory.address);
      console.log("(NEW) CREATE2 of 3rd token, ADDR: %s owner balance: %s gas: %s\n", addresses[2], ownerBalance3, receipt.gasUsed);
      
      tx = await token3.destroy();
      receipt = await tx.wait();
      console.log("(NEW) SELFDESTRUCT of 3rd token: %s gas: %s\n", addresses[2], receipt.gasUsed);

      tx = await tokenFactory.create2FactoryToken(666);
      receipt = await tx.wait();
      addresses = await tokenFactory.getFactoryTokens();
      const token4 = await FactoryToken.attach(addresses[3]);
      ownerBalance4 = await token4.balanceOf(tokenFactory.address);
      console.log("(NEW) CREATE2 of 4th token, ADDR: %s owner balance: %s gas: %s\n", addresses[3], ownerBalance4, receipt.gasUsed);

    });
  });

});
