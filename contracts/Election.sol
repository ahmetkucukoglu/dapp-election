pragma solidity ^0.4.20;

contract Election {
    //Aday modeli
    struct Candidate {
        address id;
        string name;
        uint voteCount;
    }

    //Kontrat sahibinin adresi
    address owner;

    //Seçmenler
    mapping(address => bool) public voters;

    //Adaylar
    mapping(address => Candidate) public candidates;
    mapping(uint => address) public candidateAddress;
    
    //Aday sayısı
    uint public candidatesCount;

    //Oy kullanıldığında tetiklenir
    event votedEvent(
        address indexed _candidateAddress,
        string _name
    );

    //Kazanan belli olduğunda tetiklenir
    event winnerEvent(
        string _name,
        uint _voteCount
    );

    //Kontrat sahibinin olması zorunlu
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    //Seçmenin bir kez oy kullanabilmesi kontrolü
    modifier onlyFirstVote() {
        require(!voters[msg.sender]);
        _;
    }

    //Adayın bir kez aday olabilmesi kontrolü
    modifier onlyFirstCanditate(){
        require(candidates[msg.sender].id == address(0));
        _;
    }

    //Kullanılacak oy için aday kontrolü
    modifier validCanditate(address _candidateAddress){
        require(candidates[_candidateAddress].id != address(0));
        _;
    }

    constructor() public { 
        owner = msg.sender;
    }

    function becomeCandidate(string _name) public payable onlyFirstCanditate {

        require(msg.value == 300);

        candidateAddress[candidatesCount] = msg.sender;
        candidates[msg.sender] = Candidate(msg.sender, _name, 0);

        candidatesCount++;
    }

    function vote(address _candidateAddress) public onlyFirstVote validCanditate(_candidateAddress) {
        voters[msg.sender] = true;

        candidates[_candidateAddress].voteCount ++;

        emit votedEvent(_candidateAddress, candidates[_candidateAddress].name);
    }

    function finish() public onlyOwner {
        
        string memory winnerName = "";
        uint winnerVoteCount = 0;
        address winnerAddress = address(0);

        for (uint i = 0; i < candidatesCount; i++) {
            address addr = candidateAddress[i];
            Candidate storage candidate = candidates[addr];

            if(candidate.voteCount > winnerVoteCount) {
                winnerVoteCount = candidate.voteCount;
                winnerName = candidate.name;
            }
        }

        winnerAddress.transfer(300);

        emit winnerEvent(winnerName, winnerVoteCount);
    }
}