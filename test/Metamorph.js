const { expect } = require("chai");

describe("Mutable contract", function () {
  let MetaDeployerContract;
  let MutDeployerContract;
  let MutableV1;
  let MutableV2;

  let provider;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    provider = owner.provider;
    
    MetaDeployerContract = await ethers.getContractFactory("MetaDeployer");
    MutDeployerContract = await ethers.getContractFactory("MutDeployer");
    MutableV1 = await ethers.getContractFactory("MutableV1");
    MutableV2 = await ethers.getContractFactory("MutableV2");
  });

  describe("Tests", function () {
    it("Replaces bytecode at the same address with new version", async function () {

        console.log("STEP 0. Preparations, create first contract in MetaDeployer->MutDeployer->MutableV* chain");
        let metaDeployer = await MetaDeployerContract.deploy();
        await metaDeployer.deployed();
        console.log("    - created MetaDeployer contract at %s", metaDeployer.address);

        console.log("STEP 1. MetaDeployer deploys MutDeployer with CREATE2");
        const deployedMutAddr = ((await (await metaDeployer.go()).wait()).events)[0].args[0];
        console.log("    - MetaDeployer created2 the new MutDeployer contract at %s", deployedMutAddr);

        console.log("STEP 2. MutDeployer deploys MutableV1 with CREATE");
        let mutDeployer = await MutDeployerContract.attach(deployedMutAddr);
        const mutableV1Addr = ((await (await mutDeployer.deploy_v1()).wait()).events)[0].args[0];
        const v1code = await provider.getCode(mutableV1Addr);
        console.log("    - MutDeployer deployed Mutable V1 to the addr: %s, (deployed code length: %s)", mutableV1Addr, v1code.length);
        let balanceV1 = await (MutableV1.attach(mutableV1Addr)).balance()
        console.log("          - users see V1 code at the addr %s and balance == %s ", mutableV1Addr, balanceV1);
        
        console.log("STEP 3. Destroy Mutable V1 (to replace it with V2 in the future)");
        let mutableV1 = MutableV1.attach(mutableV1Addr);
        await (await mutableV1.destroy()).wait();
        console.log("    - MutableV1 at the addr: %s is selfdestructed", mutableV1Addr);
        
        console.log("STEP 4. Destroy MutDeployer (resetting MutDeployer nonce to 0)");
        await (await mutDeployer.destroy()).wait();
        console.log("    - MutDeployer at %s is selfdestructed", deployedMutAddr);
        
        console.log("STEP 5. MetaDeployer deploys MutDeployer with CREATE2 second time after destruction");
        const deployedMutAddrSecond = ((await (await metaDeployer.go()).wait()).events)[0].args[0];
        console.log("    - MetaDeployer created2 the same MutDeployer contract at %s", deployedMutAddrSecond);

        console.log("STEP 6. MutDeployer deploys MutableV2 (on the same address, where MutableV1 was)");
        const mutableV2Addr = ((await (await mutDeployer.deploy_v2()).wait()).events)[0].args[0];
        let v2code = await provider.getCode(mutableV2Addr);

        console.log("     - MutDeployer deployed Mutable V2 to the SAME addr: %s, (deployed code length: %s)", mutableV2Addr, v2code.length);
        let balanceV2 = await (MutableV1.attach(mutableV1Addr)).balance()
        console.log("          - users see V2 code at the addr %s and balance == %s ", mutableV1Addr, balanceV2);
 
 
        // to be sure that all addreses still the same
        expect(deployedMutAddrSecond == deployedMutAddr);
        expect(mutableV1Addr == mutableV2Addr);
    });
  });
});
