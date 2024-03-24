// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import { FramecoinLaunchpad } from "./FramecoinLaunchpad.sol";

contract FramecoinFactory {
    address public implementationAddress;
    address public owner;
    event FramecoinTokenCreated(address indexed cloneAddress);

    constructor(address _implementationAddress) {
        implementationAddress = _implementationAddress;
        owner = msg.sender; // Setting the owner to the account that deploys the factory
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /**
     * @dev Allows changing the owner of the factory.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        owner = newOwner;
    }

    /**
     * @dev Deploys a clone of the FramecoinLaunchpad contract.
     * @param name The name of the Framecoin token.
     * @param symbol The symbol of the Framecoin token.
     * @return cloneAddress The address of the newly deployed clone contract.
     */
    function createToken(
        string memory name,
        string memory symbol
    ) public payable returns (address) {
        address newAddress = Clones.clone(implementationAddress);
        FramecoinLaunchpad.init(name, symbol);
        emit FramecoinTokenCreated(newAddress);
        return newAddress;
    }

    /**
     * @dev Updates the implementation address for new clones.
     * @param _newImplementationAddress The address of the new implementation contract.
     */
    function updateImplementationAddress(address _newImplementationAddress) public onlyOwner {
        require(_newImplementationAddress != address(0), "New implementation address cannot be zero.");
        implementationAddress = _newImplementationAddress;
    }
}
