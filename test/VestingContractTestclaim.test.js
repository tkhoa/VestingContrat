const {expect} = require ("chai");
const {ethers} = require("hardhat");
const { BigNumber } = require ("bignumber.js");

describe ("Vesting Contract", function () {
    let VestingContract, vestingContract, OilToken, oilToken, owner, addr1, addr2, addr3;
    const _DEFAULT_ISSUE_TOKEN = 1000000000000000000000;
    const decimals = ethers.BigNumber.from(10).pow(18);
    //const addrOilToken = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    beforeEach(async function(){
        //setup
        [owner, addr1, addr2, addr3, ...addr4] = await ethers.getSigners();
        let utcTimestamp = new Date().getTime();
        utcTimestamp = 1498140000;

        OilToken = await ethers.getContractFactory("OilToken");
        oilToken = await OilToken.deploy();

        VestingContract = await ethers.getContractFactory("VestingContract");
        vestingContract = await VestingContract.deploy(
            oilToken.address, 
            20, 
            utcTimestamp , 
            5, 
            2, 
            2,  
            ethers.BigNumber.from(1000).mul(decimals)
        );
        console.log("timestamp: ",utcTimestamp);
    });
    
    it("Check Claim Function", async function(){
        // Add Whitelist
        await vestingContract.addWhiteList(addr1.address, 1000, 0);
        await vestingContract.addWhiteList(addr2.address, 3500, 0);
        await vestingContract.addWhiteList(addr3.address, 2300, 0);

        //Issuing Token for Owner
        await oilToken.issueToken();
        
        //Approve for vestingContract to using owner's token
        const totalTokens = await vestingContract.getTotalTokens();
        await oilToken.approve(vestingContract.address, totalTokens);
        //console.log("allowance: ", await oilToken.allowance(owner.address, vestingContract.address));
        //Call fundVesting to send token to vesting contract
        console.log("addr ves: ", vestingContract.address);
        console.log("addr user1: ", addr1.address);
        //console.log("allowance: ", await oilToken.allowance(vestingContract.address, addr1.address));
        
        await vestingContract.fundVesting(totalTokens);

        //Test Claim function
        const initialBalanceUser1 = await oilToken.balanceOf(addr1.address);
        console.log("User1 starting claim...");
        //setTimeout(vestingContract.connect(addr1.address).claimed(),4500); //claiming after start time
        //await function(){setTimeout(vestingContract.connect(addr1.address).claim(),60000);};
        await new Promise((resolve) => setTimeout(resolve, 18500));
        
        await vestingContract.connect(addr1).claim();
        console.log("User1 finish...");
        const finalBalanceUser1 = await oilToken.balanceOf(addr1.address);
        expect(finalBalanceUser1, "User1's  ").to.equal(1000);
    });
});