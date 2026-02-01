pragma solidity ^0.8.20;

contract AcademicVerifier {
    struct VerificationRequest {
        address student;
        uint256 timestamp;
        bool verified;
    }

    mapping(bytes32 => VerificationRequest) public verifications;
    
    event ProofVerified(
        bytes32 indexed requestId,
        address indexed student,
        uint256 timestamp
    );

    event ProofRejected(
        bytes32 indexed requestId,
        address indexed student,
        uint256 timestamp
    );

    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) public returns (bool) {
        bytes32 requestId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, input[0])
        );

        bool isValid = _verifyZKProof(a, b, c, input);

        verifications[requestId] = VerificationRequest({
            student: msg.sender,
            timestamp: block.timestamp,
            verified: isValid
        });

        if (isValid) {
            emit ProofVerified(requestId, msg.sender, block.timestamp);
        } else {
            emit ProofRejected(requestId, msg.sender, block.timestamp);
        }

        return isValid;
    }

    function _verifyZKProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) internal pure returns (bool) {
        return input[0] > 0;
    }

    function getVerification(bytes32 requestId) 
        public 
        view 
        returns (
            address student,
            uint256 timestamp,
            bool verified
        ) 
    {
        VerificationRequest memory req = verifications[requestId];
        return (req.student, req.timestamp, req.verified);
    }
}
