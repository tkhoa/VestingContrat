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
        [owner, addr1, addr2, ...addr3] = await ethers.getSigners();
        utcTimestamp = new Date().getTime();

        OilToken = await ethers.getContractFactory("OilToken");
        oilToken = await OilToken.deploy();

        VestingContract = await ethers.getContractFactory("VestingContract");
        vestingContract = await VestingContract.deploy(
            oilToken.address, 
            20, 
            utcTimestamp + 10 , 
            8, 
            10, 
            15,  
            ethers.BigNumber.from(1000).mul(decimals)
        );
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
            console.log(addr1.address);
            //console.log(await vestingContract.userInfo[addr1.address].amount);

            await vestingContract.addWhiteList(addr1.address, 1000, 0);
            await vestingContract.addWhiteList(addr2.address, 3500, 0);
            // await vestingContract.addWhiteList(addr3, 2300, 0);
            console.log(await  (vestingContract.getUser(addr1.address).amount.value));
            //Check whitelist is added
            expect(await vestingContract.getUser(addr1.address).amount, "User1's amount is not correct").to.equal(1000);
            expect( await vestingContract.userInfo[addr2.address].amount, "User1's amount is not correct").to.equal(3500);
            // expect(userInfo[addr3].amount, "User1's amount is not correct").to.equal(2300);
            expect(vestingContract.userInfo[addr1.address].tokensClaimed, "User1's claimed tokens are not correct").to.equal(0);
            expect(vestingContract.userInfo[addr2.address].tokensClaimed, "User2's claimed tokens are not correct").to.equal(0);
            // expect(userInfo[addr3].tokensClaimed, "User3's claimed tokens are not correct").to.equal(0);
        })

        // it ()
    });


});