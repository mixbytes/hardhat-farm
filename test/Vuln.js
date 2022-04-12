const { expect } = require("chai");

describe("Vuln contract", function () {
  let provider;
  let Vuln1;
  let vuln1;
  let PoisonedToken;
  let poisonedToken;
  let CoolDeFiProtocolWithAnyToken;
  let coolDeFiProtocolWithAnyToken;

  let owner;
  let addr1;
  let addr2;
  let addrs;
    

  beforeEach(async function () {
    Vuln1 = await ethers.getContractFactory("Vuln1");
    vuln1 = await Vuln1.deploy();
    await vuln1.deployed();

    PoisonedToken = await ethers.getContractFactory("PoisonedToken");
    poisonedToken = await PoisonedToken.deploy();
    await poisonedToken.deployed();

    CoolDeFiProtocolWithAnyToken = await ethers.getContractFactory("CoolDeFiProtocolWithAnyToken");
    coolDeFiProtocolWithAnyToken = await CoolDeFiProtocolWithAnyToken.deploy();
    await coolDeFiProtocolWithAnyToken.deployed();

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    provider = ethers.getDefaultProvider(); 
    });

  describe("Broken match", function () {
    it("Go", async function () {
      await vuln1.connect(addr1).registerPlayer1({value:ethers.utils.parseUnits("1","ether")});
      await vuln1.connect(addr2).registerPlayer1({value:ethers.utils.parseUnits("1","ether")});

      // make 65535 score to break the match
      await vuln1.connect(addr1).scorePlayer1(655);
      await vuln1.connect(addr2).scorePlayer2(200);
      
      await vuln1.connect(addr1).payForMatch();

      console.log(await provider.getBalance(vuln1.address));
    });
  });

  describe("Poisoned balance", function () {
    it("Go", async function () {
      await poisonedToken.connect(owner).mint(addr1.address, 555);
      await poisonedToken.connect(owner).setFuckedAddr(coolDeFiProtocolWithAnyToken.address);
      await coolDeFiProtocolWithAnyToken.connect(owner).setUserToken(poisonedToken.address);
      
      // ask balance from Token contract
      let userBalancePure = await poisonedToken.connect(addr1).balanceOf(addr1.address);
      console.log("Token balance of user " + addr1.address + ": " + userBalancePure);
      
      await coolDeFiProtocolWithAnyToken.connect(addr1).coolDeFiOperation();

      // ask balance from DeFi protocol
      let userBalanceDeFi = await coolDeFiProtocolWithAnyToken.connect(addr1).balanceOf(addr1.address);
      console.log("DeFi  balance of user " + addr1.address + ": " + userBalanceDeFi);
    });
  });
});
