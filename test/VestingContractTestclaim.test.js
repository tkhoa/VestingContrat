const {expect} = require ("chai");
const {ethers} = require("hardhat");
const { BigNumber } = require ("bignumber.js");

describe ("Vesting Contract", function () {
    let VestingContract, vestingContract, OilToken, oilToken, owner, addr1, addr2, addr3;
    const _DEFAULT_ISSUE_TOKEN = 1000000000000000000000;
    const decimals = ethers.BigNumber.from(10).pow(18);

    beforeEach(async function(){
        //setup
        [owner, addr1, addr2, addr3, ...addr4] = await ethers.getSigners();
        //let utcTimestamp = new Date().getTime();
        //utcTimestamp = 1498140000;
        
        let currentBlockNumber = await ethers.provider.getBlockNumber();
        let currentBlock =  await ethers.provider.getBlock(currentBlockNumber);
        let utcTimestamp = await currentBlock.timestamp;

        OilToken = await ethers.getContractFactory("OilToken");
        oilToken = await OilToken.deploy();

        VestingContract = await ethers.getContractFactory("VestingContract");
        vestingContract = await VestingContract.deploy(
            oilToken.address, 
            20, 
            utcTimestamp , 
            5, 
            5, 
            5,  
            ethers.BigNumber.from(1000).mul(decimals)
        );
        console.log("YES yES......");
    });
    describe("Claim Function", function () {   
        it.only("Check Claim Function - User claim in cliff time", async function(){
            // Add Whitelist
            await vestingContract.addWhiteList(addr1.address, 1000, 0);

            //Issuing Token for Owner
            await oilToken.issueToken();
            
            //Approve for vestingContract to using owner's token
            const totalTokens = await vestingContract.getTotalTokens();
            await oilToken.approve(vestingContract.address, totalTokens);

            //Call fundVesting to send token to vesting contract
            await vestingContract.fundVesting(totalTokens);

            //Test Claim function
            const initialBalanceUser1 = await oilToken.balanceOf(addr1.address);

            //Wait 3s
            await new Promise((resolve) => setTimeout(resolve, 1000));
            //Claim in Cliff time
            //console.log("User1 starting claim...");        
            await vestingContract.connect(addr1).claim();
            
            const inCliffBalanceUser1 = await oilToken.balanceOf(addr1.address);
            expect(inCliffBalanceUser1, "User1 claim failed").to.equal(200);
            //console.log("User1 finish...");
        });

        it("Check Claim Function - User claim when duration finish", async function(){
            // Add Whitelist
            await vestingContract.addWhiteList(addr1.address, 1000, 0);

            //Issuing Token for Owner
            await oilToken.issueToken();
            
            //Approve for vestingContract to using owner's token
            const totalTokens = await vestingContract.getTotalTokens();
            await oilToken.approve(vestingContract.address, totalTokens);

            //Call fundVesting to send token to vesting contract
            await vestingContract.fundVesting(totalTokens);

            //Test Claim function
            const initialBalanceUser1 = await oilToken.balanceOf(addr1.address);

            //Wait 16s
            await new Promise((resolve) => setTimeout(resolve, 20000));
            //Claim when the duration finish 
            await vestingContract.connect(addr1).claim();
            
            const finalBalanceUser1 = await oilToken.balanceOf(addr1.address);
            expect(finalBalanceUser1, "User1 claim failed").to.equal(1000);
            console.log("User1 finish...");
        });

        // it("Check Claim Function - Claim in cliff time", async function(){
        //     // Add Whitelist
        //     await vestingContract.addWhiteList(addr2.address, 3500, 0);

        //     //Issuing Token for Owner
        //     await oilToken.issueToken();
            
        //     //Approve for vestingContract to using owner's token
        //     const totalTokens = await vestingContract.getTotalTokens();
        //     await oilToken.approve(vestingContract.address, totalTokens);

        //     //Call fundVesting to send token to vesting contract
        //     await vestingContract.fundVesting(totalTokens);

        //     //Test Claim function
        //     const initialBalanceUser2 = await oilToken.balanceOf(addr2.address);
        //     console.log("User2 starting claim...");

        //     await vestingContract.connect(addr2).claim();
        //     console.log(await oilToken.balanceOf(addr2.address));

        //     await new Promise((resolve) => setTimeout(resolve, 1000));
            
        //     //await vestingContract.connect(addr2).claim();
        //     //console.log(await oilToken.balanceOf(addr2.address));
            
        //     console.log("User2 finish...");
        //     const finalBalanceUser2 = await oilToken.balanceOf(addr2.address);
        //     expect(finalBalanceUser2, "User2's  ").to.equal(700);
        // });
    });
});