// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "./Groth16Verifier.sol";

/**
 * @title GPAVerifier
 * @notice Main contract for verifying academic credentials using ZK proofs
 * @dev Combines Groth16 verification with storage and events
 */
contract GPAVerifier {
    Groth16Verifier private immutable verifier;

    struct VerificationRecord {
        address submitter;
        string studentName;
        uint256 threshold;
        bool verified;
        uint256 timestamp;
    }

    mapping(bytes32 => VerificationRecord) public verifications;
    
    event ProofVerified(
        bytes32 indexed verificationCode,
        address indexed student,
        uint256 threshold,
        uint256 timestamp
    );

    event ProofRejected(
        bytes32 indexed verificationCode,
        address indexed student,
        uint256 timestamp
    );

    constructor() {
        verifier = new Groth16Verifier();
    }

    /**
     * @notice Verify a ZK proof of GPA threshold
     * @param code Unique verification code
     * @param a Proof point A
     * @param b Proof point B
     * @param c Proof point C
     * @param pubSignals Public signals [result, threshold]
     * @return Boolean indicating if proof is valid
     */
    function verifyProof(
        bytes32 code,
        string memory studentName,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory pubSignals
    ) public returns (bool) {
        require(verifications[code].timestamp == 0, "Code already used");
        require(bytes(studentName).length > 0, "Student name required");

        bool isValid = verifier.verifyProof(a, b, c, pubSignals);

        verifications[code] = VerificationRecord({
            submitter: msg.sender,
            studentName: studentName,
            threshold: pubSignals[1],
            verified: isValid,
            timestamp: block.timestamp
        });

        if (isValid) {
            emit ProofVerified(code, msg.sender, pubSignals[1], block.timestamp);
        } else {
            emit ProofRejected(code, msg.sender, block.timestamp);
        }

        return isValid;
    }

    /**
     * @notice Get verification record by code
     * @param code Verification code
     * @return submitter Address of the account that submitted the proof
     * @return studentName Name of the student from the academic document
     * @return threshold GPA threshold that was verified
     * @return verified Whether the proof was valid
     * @return timestamp When the verification occurred
     */
    function getVerification(bytes32 code) 
        public 
        view 
        returns (
            address submitter,
            string memory studentName,
            uint256 threshold,
            bool verified,
            uint256 timestamp
        ) 
    {
        VerificationRecord memory record = verifications[code];
        return (record.submitter, record.studentName, record.threshold, record.verified, record.timestamp);
    }

    /**
     * @notice Check if a verification code exists
     * @param code Verification code
     * @return Boolean indicating if code has been used
     */
    function isCodeUsed(bytes32 code) public view returns (bool) {
        return verifications[code].timestamp != 0;
    }
}
