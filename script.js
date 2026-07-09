const policies = [
  {
    id: "POL-PA-102",
    title: "Prior authorization documentation",
    text: "Prior authorization requests require diagnosis code, clinical notes, member plan eligibility, and treatment rationale before approval routing.",
    tags: ["prior authorization", "clinical notes", "diagnosis code", "documentation"],
  },
  {
    id: "POL-RX-210",
    title: "Specialty drug medical necessity",
    text: "Specialty drug claims above the standard threshold require medical necessity review, prescriber notes, and prior therapy evidence.",
    tags: ["specialty drug", "prescription", "medical necessity", "high amount"],
  },
  {
    id: "POL-OON-044",
    title: "Out-of-network review",
    text: "Out-of-network claims require network exception review, eligibility verification, and member notification before payment decision.",
    tags: ["out-of-network", "eligibility", "exception", "review"],
  },
  {
    id: "POL-FRD-018",
    title: "Duplicate and suspicious claim patterns",
    text: "Duplicate claim patterns, repeated denials, and unusual provider/member history should be routed to fraud or special investigation review.",
    tags: ["duplicate", "repeated denials", "fraud", "history"],
  },
  {
    id: "POL-EMG-301",
    title: "Emergency care routing",
    text: "Emergency care claims should be prioritized when delayed payment or documentation gaps may affect member access or continuity of care.",
    tags: ["emergency care", "urgent", "continuity", "days open"],
  },
];

let claims = [
  {
    id: "CLM-48291",
    memberType: "Commercial",
    claimType: "Prior Authorization",
    amount: 6200,
    daysOpen: 9,
    documentation: "Missing clinical notes",
    history: "Recent plan change",
    provider: "Northwest Specialty Clinic",
  },
  {
    id: "CLM-48277",
    memberType: "Medicare Advantage",
    claimType: "Specialty Drug",
    amount: 18300,
    daysOpen: 4,
    documentation: "Missing prior authorization",
    history: "Repeated denials",
    provider: "Evergreen Pharmacy",
  },
  {
    id: "CLM-48266",
    memberType: "Commercial",
    claimType: "Emergency Care",
    amount: 4100,
    daysOpen: 12,
    documentation: "Complete",
    history: "Stable history",
    provider: "Lake Union ER",
  },
  {
    id: "CLM-48248",
    memberType: "Medicaid",
    claimType: "Out-of-Network",
    amount: 9700,
    daysOpen: 17,
    documentation: "Missing diagnosis code",
    history: "Duplicate claim pattern",
    provider: "Cascade Imaging",
  },
  {
    id: "CLM-48235",
    memberType: "Commercial",
    claimType: "Prescription",
    amount: 840,
    daysOpen: 2,
    documentation: "Complete",
    history: "Stable history",
    provider: "Retail Pharmacy 118",
  },
];

let selectedClaimId = claims[0].id;

function tokenize(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function retrievePolicies(claim) {
  const query = tokenize([
    claim.memberType,
    claim.claimType,
    claim.documentation,
    claim.history,
    claim.amount > 10000 ? "high amount" : "",
    claim.daysOpen > 10 ? "days open urgent" : "",
  ].join(" "));

  return policies
    .map((policy) => {
      const searchable = tokenize(`${policy.title} ${policy.text} ${policy.tags.join(" ")}`);
      const score = query.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
      return { ...policy, score };
    })
    .filter((policy) => policy.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function analyzeClaim(claim) {
  const signals = {
    amountRisk: Math.min(100, Math.round((claim.amount / 20000) * 100)),
    ageRisk: Math.min(100, claim.daysOpen * 6),
    documentationRisk: claim.documentation === "Complete" ? 8 : 72,
    historyRisk:
      claim.history === "Stable history"
        ? 12
        : claim.history === "Recent plan change"
          ? 42
          : claim.history === "Repeated denials"
            ? 76
            : 88,
    clinicalRisk:
      claim.claimType === "Specialty Drug"
        ? 82
        : claim.claimType === "Emergency Care"
          ? 68
          : claim.claimType === "Out-of-Network"
            ? 72
            : claim.claimType === "Prior Authorization"
              ? 62
              : 24,
  };

  const risk = Math.round(
    signals.amountRisk * 0.18 +
      signals.ageRisk * 0.17 +
      signals.documentationRisk * 0.24 +
      signals.historyRisk * 0.21 +
      signals.clinicalRisk * 0.2,
  );

  const missing = [];
  if (claim.documentation !== "Complete") missing.push(claim.documentation.replace("Missing ", ""));
  if (claim.claimType === "Prior Authorization" || claim.documentation === "Missing prior authorization") {
    missing.push("prior authorization verification");
  }
  if (claim.claimType === "Specialty Drug") missing.push("medical necessity rationale");
  if (claim.claimType === "Out-of-Network") missing.push("network exception review");
  if (missing.length === 0) missing.push("No critical evidence gaps detected");

  let queue = "Fast Track";
  if (risk >= 72) queue = "Clinical Review";
  if (claim.amount > 15000 || claim.daysOpen > 14) queue = "Clinical Review";
  if (claim.documentation !== "Complete") queue = "Missing Documentation";
  if (claim.history === "Duplicate claim pattern" || claim.history === "Repeated denials") queue = "Fraud Review";

  const confidence = Math.max(72, Math.min(96, 98 - Math.abs(55 - risk) / 2 - (missing.length - 1) * 3));
  const status = risk >= 72 ? "High Risk" : risk >= 46 ? "Medium Risk" : "Low Risk";
  const policyEvidence = retrievePolicies(claim);

  const summary = `${claim.id} is a ${claim.memberType.toLowerCase()} ${claim.claimType.toLowerCase()} claim from ${claim.provider}. The model assigns ${status.toLowerCase()} because of ${claim.documentation.toLowerCase()}, ${claim.history.toLowerCase()}, a $${claim.amount.toLocaleString()} claim amount, and ${claim.daysOpen} days open.`;

  const action =
    queue === "Fraud Review"
      ? "Route to special investigation review, hold automated payment decision, and request supporting documentation before adjudication."
      : queue === "Missing Documentation"
        ? "Request missing evidence, notify the provider queue, and pause final decision until documentation is attached."
        : queue === "Clinical Review"
          ? "Send to clinical reviewer with retrieved policy evidence and prioritize before lower-risk claims."
          : "Approve for accelerated review path after eligibility and duplicate checks pass.";

  return {
    ...claim,
    risk,
    status,
    queue,
    confidence: Math.round(confidence),
    missing,
    signals,
    policyEvidence,
    summary,
    action,
    audit: [
      `Claim ${claim.id} received through secure intake API`,
      `Risk score ${risk} calculated with ${Math.round(confidence)}% confidence`,
      `${policyEvidence.length} policy passages retrieved for reviewer context`,
      `Claim routed to ${queue}`,
    ],
  };
}

function getAnalyzedClaims() {
  return claims.map(analyzeClaim).sort((a, b) => b.risk - a.risk);
}

function riskClass(risk) {
  if (risk >= 72) return "high";
  if (risk >= 46) return "medium";
  return "low";
}

function renderDashboard() {
  const analyzed = getAnalyzedClaims();
  document.querySelector("#heroClaims").textContent = analyzed.length;
  document.querySelector("#heroHighRisk").textContent = analyzed.filter((claim) => claim.risk >= 72).length;
  document.querySelector("#heroAvgConfidence").textContent = `${Math.round(
    analyzed.reduce((total, claim) => total + claim.confidence, 0) / analyzed.length,
  )}%`;
}

function renderClaimList() {
  const filter = document.querySelector("#queueFilter").value;
  const list = document.querySelector("#claimList");
  const analyzed = getAnalyzedClaims().filter((claim) => filter === "all" || claim.queue === filter);

  list.innerHTML = analyzed
    .map(
      (claim) => `
        <button class="claim-button ${claim.id === selectedClaimId ? "active" : ""}" data-claim-id="${claim.id}" type="button">
          <strong>${claim.id} - ${claim.claimType}</strong>
          <span>${claim.memberType} • ${claim.provider}</span>
          <div class="mini-row">
            <span>${claim.queue}</span>
            <span>${claim.risk} risk</span>
          </div>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".claim-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedClaimId = button.dataset.claimId;
      renderAll();
    });
  });

  if (!analyzed.some((claim) => claim.id === selectedClaimId) && analyzed[0]) {
    selectedClaimId = analyzed[0].id;
    renderAll();
  }
}

function renderClaimDetail() {
  const claim = getAnalyzedClaims().find((item) => item.id === selectedClaimId) || getAnalyzedClaims()[0];
  const className = riskClass(claim.risk);
  const gauge = document.querySelector(".risk-gauge");

  document.querySelector("#claimStatus").textContent = `${claim.status} • ${claim.queue}`;
  document.querySelector("#claimStatus").className = `status-pill ${className}`;
  document.querySelector("#claimTitle").textContent = `${claim.id} - ${claim.claimType}`;
  document.querySelector("#claimSubtitle").textContent = `${claim.memberType} member • ${claim.provider} • $${claim.amount.toLocaleString()} • ${claim.daysOpen} days open`;
  document.querySelector("#riskScore").textContent = claim.risk;
  gauge.style.setProperty("--risk-angle", `${claim.risk * 3.6}deg`);

  document.querySelector("#aiSummary").textContent = claim.summary;
  document.querySelector("#nextAction").textContent = claim.action;
  document.querySelector("#missingEvidence").innerHTML = claim.missing.map((item) => `<li>${item}</li>`).join("");

  document.querySelector("#modelSignals").innerHTML = Object.entries(claim.signals)
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
      return `
        <div class="signal">
          <span>${label}</span>
          <strong>${value}</strong>
          <div class="signal-track"><div class="signal-bar" style="width:${value}%"></div></div>
        </div>
      `;
    })
    .join("");

  document.querySelector("#policyResults").innerHTML = claim.policyEvidence
    .map(
      (policy) => `
        <div class="policy-item">
          <strong>${policy.id} - ${policy.title}</strong>
          <span>${policy.text}</span>
        </div>
      `,
    )
    .join("");

  document.querySelector("#auditTrail").innerHTML = claim.audit
    .map(
      (event, index) => `
        <div class="audit-item">
          <strong>${String(index + 1).padStart(2, "0")} ${event}</strong>
          <span>${new Date(Date.now() - index * 45000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      `,
    )
    .join("");
}

function renderAll() {
  renderDashboard();
  renderClaimList();
  renderClaimDetail();
}

document.querySelector("#queueFilter").addEventListener("change", renderClaimList);

function createSyntheticClaim() {
  const id = `CLM-${Math.floor(50000 + Math.random() * 40000)}`;
  const claim = {
    id,
    memberType: document.querySelector("#memberType").value,
    claimType: document.querySelector("#claimType").value,
    amount: Number(document.querySelector("#claimAmount").value),
    daysOpen: Number(document.querySelector("#daysOpen").value),
    documentation: document.querySelector("#documentation").value,
    history: document.querySelector("#history").value,
    provider: "Synthetic Intake Provider",
  };

  claims = [claim, ...claims];
  selectedClaimId = id;
  document.querySelector("#queueFilter").value = "all";
  renderAll();
  document.querySelector("#workspace").scrollIntoView({ behavior: "smooth" });
}

document.querySelector("#claimForm").addEventListener("submit", (event) => {
  event.preventDefault();
  createSyntheticClaim();
});

document.querySelector("#runTriageButton").addEventListener("click", (event) => {
  event.preventDefault();
  createSyntheticClaim();
});

renderAll();
