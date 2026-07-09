# AI Healthcare Claims Triage Platform

Full stack AI/ML portfolio project by Sreya Kotha.

## Overview

AI Healthcare Claims Triage Platform is a synthetic healthcare workflow demo that shows how enterprise claims teams can use AI-assisted decision support to prioritize claims, identify missing documentation, retrieve relevant policy evidence, and route work to the correct review queue.

The project is designed to communicate full stack engineering strength across Java/Spring Boot-style architecture, React-style dashboard workflows, cloud/event-driven patterns, observability, and AI/ML product thinking.

This demo intentionally uses generated sample claims only. It does not process real patient data, PHI, or production healthcare records.

## Live Demo

Public demo:

```text
https://sreyakotha.github.io/ai-healthcare-claims-triage/
```

Run locally:

```text
http://localhost:8766/ai-healthcare-claims-triage/index.html
```

## Features

- Synthetic claims queue with priority ordering
- Risk scoring across amount, claim age, documentation, member history, and clinical complexity
- RAG-style policy evidence retrieval
- AI-style case summary and recommended action
- Missing documentation detection
- Queue routing for clinical review, missing documentation, fast track, and fraud review
- Audit trail and confidence tracking
- Responsive recruiter-facing UI

## Why I Built This

I built this project to connect my enterprise Java full stack background with applied AI/ML workflows in a healthcare context. My professional experience includes healthcare platforms, claims and prescription workflows, REST APIs, Spring Boot microservices, React applications, AWS services, Kafka/event-driven systems, Redis caching, SQL/NoSQL databases, CI/CD, security, and observability.

This project demonstrates how those skills can translate into AI-enabled healthcare software where explainability, auditability, routing, and operational reliability matter.

## AI/ML Design

The demo includes a lightweight local triage engine that simulates production AI workflows:

- Risk classification using claim amount, days open, documentation state, member history, and clinical complexity
- Missing evidence detection for prior authorization, clinical notes, diagnosis codes, specialty drug rationale, and network exceptions
- RAG-style retrieval from synthetic policy passages
- AI-style claim summary and recommended action generation
- Confidence and audit event tracking for reviewer transparency

In a production implementation, the local scoring and summary logic could be replaced with:

- A Python model service for classification
- Embeddings and vector search for policy/document retrieval
- LLM APIs for summarization and next-action generation
- Model monitoring for drift, latency, confidence, and reviewer feedback

## Architecture

```text
React Dashboard
  -> Spring Boot REST APIs
    -> Claims Triage Service
      -> Risk Classification
      -> Policy Retrieval / RAG
      -> Recommendation Engine
      -> Audit Event Publisher
    -> PostgreSQL / DynamoDB
    -> Redis Cache
    -> Kafka or AWS EventBridge
    -> CloudWatch-style Observability
```

## Target Production Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, dashboard workflows, queue management |
| Backend | Java, Spring Boot, REST APIs, GraphQL-ready contracts |
| AI/ML | Classification, RAG, embeddings, confidence scoring, summarization |
| Data | PostgreSQL, DynamoDB, Redis |
| Events | Apache Kafka, AWS EventBridge |
| Cloud | AWS Lambda, API Gateway, S3, CloudWatch, IAM |
| Security | OAuth2, JWT, RBAC, audit logging |
| DevOps | Docker, GitHub Actions, CI/CD |

## Portfolio Story

This project is meant to demonstrate that I can:

- Translate healthcare workflow needs into usable software
- Design full stack systems with reviewer-friendly interfaces
- Build explainable AI-assisted workflows instead of black-box demos
- Think about security, auditability, and production readiness
- Connect Java/Spring Boot backend architecture with modern AI features

## Screens To Highlight

- Dashboard hero with synthetic claim volume and confidence metrics
- Triage workspace showing risk score, queue routing, and model signals
- Retrieved policy evidence panel
- Audit trail panel
- Synthetic claim intake form

## Resume Bullets

- Built an AI-enabled healthcare claims triage platform that classifies synthetic claims by urgency, denial risk, and missing documentation while generating explainable next-action recommendations.
- Implemented retrieval-augmented policy matching to summarize claim context, surface relevant coverage rules, and support auditable decision workflows through a React-style dashboard.
- Designed production-style API, security, and observability patterns including JWT-style access boundaries, structured audit events, confidence scoring, queue routing, and event-driven processing.

## LinkedIn Project Summary

Built a full stack AI-enabled healthcare claims triage platform that classifies synthetic claims by urgency, denial risk, missing documentation, and routing queue. The demo includes explainable risk scoring, RAG-style policy retrieval, AI-generated next actions, audit events, and a responsive dashboard designed around enterprise healthcare review workflows.

## Run Locally

From the repository root:

```bash
python3 -m http.server 8766 -d outputs
```

Then open:

```text
http://localhost:8766/ai-healthcare-claims-triage/index.html
```

You can also open `index.html` directly in a browser.

## Disclaimer

This is a portfolio project using synthetic data and simplified local AI logic. It is not a medical device, claims adjudication system, or production healthcare decision engine.
