// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UnlonelyAdminContractV1 {
    mapping(address => bool) public admins;
    address public owner;

    event AdminAdded(address indexed newAdmin);
    event AdminRemoved(address indexed admin);

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true; // The deployer is the first admin
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    function addAdmin(address newAdmin) public onlyOwner {
        admins[newAdmin] = true;
        emit AdminAdded(newAdmin);
    }

    function removeAdmin(address admin) public onlyOwner {
        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function isAdmin(address user) external view returns (bool) {
        return admins[user];
    }
}