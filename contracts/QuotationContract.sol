pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract QuotationContract {
    uint public quotationCount = 0; //estado do contato
    uint public taskCount = 0; //estado do contato
    struct Task {
        uint id;
        uint quoteId;
        string jsonContent;
    }
    struct Quotation {
        uint id;
        uint numTasks;
        string jsonContent;
    }

    mapping(uint => Quotation) public quotations; //id da quotation
    mapping(uint => Task) public tasks; //id da task

    event QuotationCreated(uint id, uint tasks, string jsonContent);
    event TaskCreated(uint id, uint quoteId, string jsonContent);

    
    function createTask(uint _id, uint _qId, string memory jsonContent) public {
        taskCount++;
        tasks[_id] = Task(_id, _qId, jsonContent);
        emit TaskCreated(_id, _qId, jsonContent);
        
    }

    function createQuotation(string memory jsonContent) public {
        quotationCount++;
        quotations[quotationCount] = Quotation(quotationCount, 1, jsonContent);
        emit QuotationCreated(quotationCount, 1, jsonContent);
    }
    
    function getQuotation(uint _id) public view returns(uint, string memory) {
        return(quotations[_id].numTasks, quotations[_id].jsonContent);
    }
    
    
    function getTask(uint _id) public view returns(uint, string memory) {
        return(tasks[_id].quoteId, tasks[_id].jsonContent);
    }
    
}
