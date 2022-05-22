const {expect} = require ("chai");

const {ethers} = require("hardhat");
const { BigNumber } = require ("bignumber.js");
//chai.use(require('chai-bignumber')(BigNumber));

describe ("Vesting Contract", function(){
    let VestingContract, vestingContract, OilToken, oilToken, owner, addr1, addr2, addr3;
    const _DEFAULT_ISSUE_TOKEN = 1000000000000000000000;
    const decimals = ethers.BigNumber.from(10).pow(18);
    const addrOilToken = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    let utcTimestamp = 0;

    beforeEach( async function(){
        [owner, addr1, addr2, addr3, ...addr4] = await ethers.getSigners();
        utcTimestamp = new Date().getTime();

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

    describe("Issuing Token For Owner", function(){
        it("Issuing Token For Owner Success", async function(){
            await oilToken.issueToken();

            const ownerBalance = await oilToken.balanceOf(owner.address);

            expect(ownerBalance).to.equal(ethers.BigNumber.from(1200).mul(decimals));
        })
    });

    describe("Vesting Contract", function(){
        //We assume the owner sends all his tokens to the vesting contract
        it("Send token to Vesting Contract", async function(){
            await oilToken.issueToken();

            const initialOwnerBalance = await oilToken.balanceOf(owner.address);
            const totalTokens = await vestingContract.getBalance();

            //Owner's balance must be greater than totalTOken
            expect(initialOwnerBalance, "The owner's balance is not enough to vesting").to.be.at.least(totalTokens);

            //owner calls approve function to grant vesting_contract permission before 
            //calling fundVesting function (transferFrom(owner, vesting_contract, total_token))
            await oilToken.approve(vestingContract.address, totalTokens);

            //Owner send to vesting_contract 1000 tokens. (*10**18 in wei)
            await vestingContract.fundVesting(totalTokens);

            const finalBalanceOwner = await oilToken.balanceOf(owner.address);
            // console.log(finalBalanceOwner);
            // console.log(initialOwnerBalance - totalTokens);
            
            const testResult = ethers.BigNumber.from(200).mul(decimals);

            expect(finalBalanceOwner,"Fund vesting error").to.equal(testResult);
        });

        it("Add Whitelist", async function() {
            //Add user to Whitelist
            await vestingContract.addWhiteList(addr1.address, 1000, 0);
            await vestingContract.addWhiteList(addr2.address, 3500, 0);
            await vestingContract.addWhiteList(addr3.address, 2300, 0);
            
            //Check whitelist
            expect(await vestingContract.getUserAmount(addr1.address), "User1's amount is not correct").to.equal(1000);
            expect( await vestingContract.getUserAmount(addr2.address), "User2's amount is not correct").to.equal(3500);
            expect( await vestingContract.getUserAmount(addr3.address), "User3's amount is not correct").to.equal(2300);

            expect( await vestingContract.getUserTokenClaimed(addr1.address), "User1's token claimed is not correct").to.equal(0);
            expect( await vestingContract.getUserTokenClaimed(addr2.address), "User2's token claimed is not correct").to.equal(0);
            expect( await vestingContract.getUserTokenClaimed(addr3.address), "User3's token claimed is not correct").to.equal(0);
        });

        
    });
});

describe("Vesting contract", function(){
    let VestingContract, vestingContract, OilToken, oilToken, owner, addr1, addr2, addr3;
    const _DEFAULT_ISSUE_TOKEN = 1000000000000000000000;
    const decimals = ethers.BigNumber.from(10).pow(18);
    const addrOilToken = "0x9a8164ca007ff0899140719e9aec9a9c889cbf1e";
    const addrVestingContrat = "0xa3e5dfe71ae3e6dec4d98fa28821df355d7244b3";
    let utcTimestamp = 0;

    it ("Checking Claim Token Function", async function(){
        // Add Whitelist
        await vestingContract.addWhiteList(addr1.address, 1000, 0);
        await vestingContract.addWhiteList(addr2.address, 3500, 0);
        await vestingContract.addWhiteList(addr3.address, 2300, 0);

        //Issuing Token for Owner
        await oilToken.issueToken();
        
        //Approve for vestingContract to using owner's token
        const totalTokens = await vestingContract.getTotalTokens();
        await oilToken.approve(vestingContract.address, totalTokens);

        //Call fundVesting to send token to vesting contract
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