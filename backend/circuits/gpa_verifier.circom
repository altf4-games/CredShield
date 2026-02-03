pragma circom 2.0.0;

// Comparison template for GPA verification
template GreaterEqThan(n) {
    signal input in[2];
    signal output out;

    component lt = LessThan(n);
    lt.in[0] <== in[0];
    lt.in[1] <== in[1];

    out <== 1 - lt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component n2b = Num2Bits(n+1);

    n2b.in <== in[0] + (1<<n) - in[1];

    out <== 1 - n2b.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

// Main GPA Verifier Circuit
template GPAVerifier() {
    // Private input (student's actual GPA, scaled by 100)
    signal input gpa;
    
    // Public inputs
    signal input threshold;  // Required threshold (scaled by 100)
    
    // Public output
    signal output result;    // 1 if gpa >= threshold, 0 otherwise
    
    // Constraint: GPA must be in valid range (0-1000 for 0.0-10.0 scale)
    signal gpaInRange;
    component gpaCheck = LessThan(16);
    gpaCheck.in[0] <== gpa;
    gpaCheck.in[1] <== 1001;  // gpa must be < 1001
    gpaInRange <== gpaCheck.out;
    gpaInRange === 1;  // Assert GPA is in valid range
    
    // Constraint: Threshold must be in valid range
    signal thresholdInRange;
    component thresholdCheck = LessThan(16);
    thresholdCheck.in[0] <== threshold;
    thresholdCheck.in[1] <== 1001;
    thresholdInRange <== thresholdCheck.out;
    thresholdInRange === 1;
    
    // Main comparison: gpa >= threshold
    component gte = GreaterEqThan(16);
    gte.in[0] <== gpa;
    gte.in[1] <== threshold;
    
    result <== gte.out;
}

component main {public [threshold]} = GPAVerifier();
