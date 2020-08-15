pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

contract QuotationContract {
    uint public quotationCount = 0;
    uint public taskCount = 0;
    struct Task {
        uint id;
        string jsonContent;
    }
    struct Quotation {
        uint id;
        string jsonContent;
    }

    mapping(uint => Quotation) public quotations;
    mapping(uint => Task) public tasks;

    event QuotationCreated(uint id, string jsonContent);
    event TaskCreated(uint id, string jsonContent);

    function createTask(string memory jsonContent) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, jsonContent);
        emit TaskCreated(taskCount, jsonContent);
    }

    function createQuotation(string memory jsonContent) public {
        quotationCount++;
        quotations[quotationCount] = Quotation(quotationCount, jsonContent);
        emit QuotationCreated(quotationCount, jsonContent);
    }
    
    function getQuotation(uint _id) public view returns(string memory) {
        return(quotations[_id].jsonContent);
    }
    
    function getTask(uint _id) public view returns(uint, string memory) {
        return(tasks[_id].id, tasks[_id].jsonContent);
    }
}
