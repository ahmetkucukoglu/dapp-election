pragma solidity ^0.4.20;

contract Election {
    //Aday modeli
    struct Candidate {
        address id;
        string name;
        string photoHash;
        uint voteCount;
    }

    //Kontrat sahibinin adresi
    address public owner;

    //Seçmenler
    mapping(address => bool) public voters;

    //Adaylar
    mapping(address => Candidate) public candidates;
    mapping(uint => address) public candidateAddress;
    
    //Aday sayısı
    uint public candidatesCount;

    //Seçim bitti
    bool public isFinished;

    //Seçimi kazanan adayın adresi
    address public winnerCandidate;

    //Oy kullanıldığında tetiklenir
    event votedEvent(
        address indexed _candidateId,
        string _candidateName,
        uint _candidateVoteCount,
        address _woterId
    );

    //Aday olunduğunda tetiklenir
    event registeredCandidateEvent(
        address indexed _candidateId,
        string _candidateName,
        string _candidatePhotoHash,
        uint _candidateVoteCount
    );

    //Kazanan belli olduğunda tetiklenir
    event winnerEvent(
        address indexed _candidateId,
        string _candidateName,
        uint _candidateVoteCount
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

    //Seçimin sona erip ermediği kontrolü
    modifier validFinishElection(){
        require(!isFinished);
        _;
    }

    constructor() public { 
        owner = msg.sender;
    }

    function becomeCandidate(string _name, string _photoHash) public payable validFinishElection onlyFirstCanditate {
        require(msg.value == 1000000000000000000);

        candidateAddress[candidatesCount] = msg.sender;
        candidates[msg.sender] = Candidate(msg.sender, _name, _photoHash, 0);

        candidatesCount++;

        emit registeredCandidateEvent(msg.sender, _name, _photoHash, 0);
    }

    function vote(address _candidateAddress) public validFinishElection onlyFirstVote validCanditate(_candidateAddress) {
        voters[msg.sender] = true;

        candidates[_candidateAddress].voteCount ++;

        emit votedEvent(_candidateAddress, candidates[_candidateAddress].name, candidates[_candidateAddress].voteCount, msg.sender);
    }

    function finish() public onlyOwner {
        string memory winnerName = "";
        uint winnerVoteCount = 0;

        for (uint i = 0; i < candidatesCount; i++) {
            address addr = candidateAddress[i];
            Candidate memory candidate = candidates[addr];

            if(candidate.voteCount > winnerVoteCount) {
                winnerVoteCount = candidate.voteCount;
                winnerName = candidate.name;
                winnerCandidate = candidate.id;
            }
        }

        winnerCandidate.transfer(1000000000000000000);

        isFinished = true;

        emit winnerEvent(winnerCandidate, winnerName, winnerVoteCount);
    }
}