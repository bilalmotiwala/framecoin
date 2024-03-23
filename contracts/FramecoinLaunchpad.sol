// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/*
Contract: Framecoin Token Launchpad Contract
Version: v0.0.1
Date: 23rd of March, 2023
Author: Bilal Motiwala
Security Contact: @bilalmotiwala on Telegram.
*/

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable@4.9.0/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable@4.9.0/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable@4.9.0/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable@4.9.0/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

contract FramecoinLaunchpad is Initializable, ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {
    using SafeMath for uint256;

    uint256 public maxSupply; // Hardcap of 1 billion tokens.
    uint256 public presaleSupply; // Presale supply of 500 million tokens.
    uint256 public initialPrice; // 0.000000004 ETH per token.
    uint256 public priceIncrease; // Percentage increase for the price. Written as 1000 for 10% for easier calculations.
    uint256 public threshold; // 100 million tokens threshold for price increase.
    uint256 public tokensAllocated; // Tokens allocated in the presale i.e. sold.

    bool public presaleCompleted; // Flag to check if the presale is completed.
    bool public poolCreated; // Flag to check if the pool is created.

    address public poolAddress; // Address of the pool contract once created.
    IUniswapV2Router02 public uniswapv2Router; // Uniswap Router v2 on Base: 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24 | Sepolia ETH: 0x86dcd3293C53Cf8EFd7303B57beb2a3F671dDE98 | Quickswap Polygon: 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff
    IUniswapV2Factory public uniswapv2Factory; // Uniswap factory address.

    constructor() {
      _disableInitializers(); // Disabling the constructor.
    }

    function initialize(string memory _name, string memory _symbol) public initializer {
      __ERC20_init(_name, _symbol);
      __UUPSUpgradeable_init();
      __Ownable_init();

      maxSupply = 1000000000 ether;
      presaleSupply = 500000000 ether;
      initialPrice = 4000000000;
      priceIncrease = 1000;
      threshold = 100000000 ether;
      tokensAllocated = 0;
      uniswapv2Router = IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24);
      uniswapv2Factory = IUniswapV2Factory(uniswapv2Router.factory());
      
      _mint(address(this), 1000000000 ether);
      _transferOwnership(address(0x03b24FB5EC47536C56065540e65f0Bd3f990fbF3));
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // Creating a function to calculate the price of the token. The token price will increase by 10% after every 100 million tokens sold.
    function calculatePrice() public view returns (uint256) {
        uint256 tokensSold = tokensAllocated;
        uint256 price = initialPrice;

        uint256 priceIncreaseCount = tokensSold.div(threshold);
        for (uint256 i = 0; i < priceIncreaseCount; i++) {
            price = price.add(price.mul(priceIncrease).div(10000));
        }
        return price;
    }

    // Creating a function to calculate tokens for a given amount of ETH.
    function tokensForEth(uint256 _ethAmount) public view returns (uint256) {
      uint256 remainingEth = _ethAmount;
      uint256 calculatedTokens = 0;
      uint256 currentPrice = calculatePrice();
      uint256 differenceToNextThreshold = threshold.sub(tokensAllocated.mod(threshold));
      uint256 ethRequiredForNextThreshold = differenceToNextThreshold.mul(currentPrice).div(1 ether);
      
      while(remainingEth > 0 && tokensAllocated.add(calculatedTokens) < maxSupply) {
        if(remainingEth >= ethRequiredForNextThreshold) {
          remainingEth = remainingEth.sub(ethRequiredForNextThreshold);
          calculatedTokens = calculatedTokens.add(differenceToNextThreshold);
          currentPrice = currentPrice.add(currentPrice.mul(priceIncrease).div(10000));
          differenceToNextThreshold = threshold;
          ethRequiredForNextThreshold = differenceToNextThreshold.mul(currentPrice).div(1 ether);
        } else {
          calculatedTokens = calculatedTokens.add(remainingEth.mul(1 ether).div(currentPrice));
          remainingEth = 0;
        }
      }

      return calculatedTokens;
    }

    // Creating a function to calculate the ETH required for a given amount of tokens.
    function ethForTokens(uint256 _tokenAmount) public view returns (uint256) {
      uint256 remainingTokens = _tokenAmount;
      uint256 calculatedEth = 0;
      uint256 currentPrice = calculatePrice();
      uint256 differenceToNextThreshold = threshold.sub(tokensAllocated.mod(threshold));
      uint256 ethRequiredForNextThreshold = differenceToNextThreshold.mul(currentPrice).div(1 ether);
      
      while(remainingTokens > 0 && tokensAllocated.add(calculatedEth) < maxSupply) {
        if(remainingTokens >= differenceToNextThreshold) {
          remainingTokens = remainingTokens.sub(differenceToNextThreshold);
          calculatedEth = calculatedEth.add(ethRequiredForNextThreshold);
          currentPrice = currentPrice.add(currentPrice.mul(priceIncrease).div(10000));
          differenceToNextThreshold = threshold;
          ethRequiredForNextThreshold = differenceToNextThreshold.mul(currentPrice).div(1 ether);
        } else {
          calculatedEth = calculatedEth.add(remainingTokens.mul(currentPrice).div(1 ether));
          remainingTokens = 0;
        }
      }

      return calculatedEth;
    }

    // Creating a function to calculate the remaining tokens available for sale.
    function getRemainingTokens() public view returns (uint256) {
      return presaleSupply.sub(tokensAllocated);
    }

    // Creating a function to buy tokens.
    function buyTokens() public payable {
      require(!presaleCompleted, "Presale completed.");
      require(msg.value > 0, "ETH required.");
      
      uint256 remainingTokens = getRemainingTokens();
      uint256 calculatedTokens = tokensForEth(msg.value);
      uint256 tokensToTransfer = 0;
      uint256 excessEth = 0;

      if (calculatedTokens <= remainingTokens) {
        // If the calculated tokens are less than or equal to the remaining tokens, allocate those tokens.
        tokensToTransfer = calculatedTokens; 
      } else {
        // If the calculated tokens are more than the remaining tokens, allocate the remaining tokens and refund the excess ETH.
        tokensToTransfer = remainingTokens;
        uint256 excessTokens = calculatedTokens.sub(remainingTokens);
        excessEth = ethForTokens(excessTokens);
      }

      require(tokensToTransfer > 0, "Insufficient ETH.");
      require(tokensAllocated.add(tokensToTransfer) <= presaleSupply, "Not enough tokens available.");
      tokensAllocated = tokensAllocated.add(tokensToTransfer);

      // Sending tokens from this contract to the buyer.
      _transfer(address(this), msg.sender, tokensToTransfer);

      // Refunding the excess ETH.
      if(excessEth > 0) {
        payable(msg.sender).transfer(excessEth);
      }

      // Ending the presale if all tokens are sold.
      if(tokensAllocated == presaleSupply) {
        presaleCompleted = true;
      }
    }

    // Creating a function to end the presale (emergency cases - remove post beta and testing).
    function endPresale() public onlyOwner {
      presaleCompleted = true;
    }

    // Creating a function to end the presale (emergency cases - remove post beta and testing).
    function withdrawEth() public onlyOwner {
      payable(owner()).transfer(address(this).balance);
    }

    // Creating a function to end the presale (emergency cases - remove post beta and testing).
    function withdrawTokens() public onlyOwner {
      _transfer(address(this), owner(), balanceOf(address(this)));
    }

    // Creating a function that creates the pool contract, the presale must be completed before this. Will be automatically called by the Framecoin team.
    function createPool() public onlyOwner {
      require(presaleCompleted, "Presale not completed.");
      require(!poolCreated, "Pool already created.");

      // Transferring 2% of the tokens and 2% of the ETH to the team wallet.
      uint256 teamTokens = maxSupply.mul(2).div(100);
      uint256 teamEth = address(this).balance.mul(2).div(100);
      _transfer(address(this), owner(), teamTokens);
      payable(owner()).transfer(teamEth);
      
      // Adding liquidity to the pool and burning the LP tokens.
      _approve(address(this), address(uniswapv2Router), balanceOf(address(this))); // Approve the router to spend the entire balance of this contract.
      uniswapv2Router.addLiquidityETH{value: address(this).balance}(address(this), balanceOf(address(this)), 0, 0, 0x000000000000000000000000000000000000dEaD, block.timestamp); // Adding liquidity to the pool with the entire balances and burning the LP tokens.

      // Getting the pool address for future reference.
      poolAddress = uniswapv2Factory.getPair(address(this), uniswapv2Router.WETH());
      poolCreated = true;
    }
}