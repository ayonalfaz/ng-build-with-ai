---
description: AI-assisted security audit — scan an Angular codebase for XSS, injection, insecure data binding, exposed secrets, and broken access control
---

# Angular Security Audit Workflow

This workflow performs a thorough security audit of an Angular codebase, checking for Angular-specific vulnerabilities, OWASP risks, and common misconfigurations. It produces a prioritised `SECURITY_REPORT.md` with concrete remediation steps.

**Trigger:** `/angular-security-audit` in AI chat
**Required input:** The scope to audit — a file, folder, or the full `src/` directory

---

## Step 1 — Define the Audit Scope

Ask the user:
1. **Scope** — a specific file/folder, or the entire application (`src/`)
2. **Known concerns** — any specific areas of worry (e.g. "we accept HTML input from users", "we store auth tokens in localStorage")
3. **Compliance context** — any standard to check against (OWASP ASVS, PCI DSS, HIPAA)? If none, default to OWASP Top 10.

---

## Step 2 — Run Automated Pattern Scans

Run all scans first to build a prioritised findings list before reading individual files.

### Scan 1 — XSS Risks
```bash
# Direct HTML injection bindings
grep -rn "innerHTML\|outerHTML" src/app --include="*.html" --include="*.ts"

# Angular DomSanitizer bypass methods
grep -rn "bypassSecurityTrust" src/app --include="*.ts"

# Dynamic URL / resource bindings
grep -rn "\[href\]\|\[src\]\|\[action\]" src/app --include="*.html"
```

### Scan 2 — Secrets and Credentials
```bash
# API keys, tokens, passwords in source files
grep -rn "api_key\|apiKey\|secret\|password\|token\|bearer\|private_key" src/ --include="*.ts" -i

# Credentials in JSON config files
grep -rn "api_key\|apiKey\|secret\|password\|token" src/ --include="*.json" -i

# URLs with embedded credentials
grep -rn "https\?://[^[:space:]]*:[^[:space:]]*@" src/ --include="*.ts"
```

### Scan 3 — Route Guard Coverage
```bash
# Find all route definitions
grep -rn "path:" src/app --include="*.routes.ts" -A3
grep -rn "path:" src/app --include="*.module.ts" -A3

# Find guard assignments
grep -rn "canActivate\|canMatch\|canLoad\|canActivateChild" src/app --include="*.ts"

# Find all guard files
find src/app -name "*.guard.ts"
```

### Scan 4 — Insecure Data Handling
```bash
# localStorage / sessionStorage usage
grep -rn "localStorage\|sessionStorage" src/app --include="*.ts"

# Sensitive data passed as URL parameters
grep -rn "queryParams\|queryParamMap\|ActivatedRoute" src/app --include="*.ts" -l

# eval() or dynamic code execution
grep -rn "\beval(\|\bnew Function(" src/app --include="*.ts"
```

### Scan 5 — HTTP Security
```bash
# All HTTP call sites
grep -rn "http\.get\|http\.post\|http\.put\|http\.patch\|http\.delete" src/app --include="*.ts"

# Existing interceptors
find src/app -name "*.interceptor.ts"

# CORS proxy configuration
cat proxy.conf.json 2>/dev/null || echo "No proxy config found"
```

### Scan 6 — Dependency Vulnerabilities
```bash
npm audit --audit-level=moderate
```

---

## Step 3 — Read and Analyse Flagged Files

For each file flagged by the scans, read it in full and assess the following:

### XSS via `[innerHTML]`
- Is the value user-controlled (from a form input, URL parameter, or API response)?
- Is it sanitised before binding?
- Is `DomSanitizer.bypassSecurityTrustHtml()` used? If yes, is there a comment explaining why it is safe?

**Safe pattern:** content originates from a controlled CMS and is sanitised server-side before storage.
**Unsafe pattern:** `<div [innerHTML]="userComment"></div>` where `userComment` comes directly from user input.

### `bypassSecurityTrust*` Usage
Every call to any `bypassSecurityTrust*` method must have a comment explaining:
- Why the content is trusted
- Where the content originates
- Who controls that origin

Flag every instance without such a comment.

### Hardcoded Secrets
Any string matching common secret patterns must be:
- Moved to environment variables or CI/CD secrets
- Never committed to version control
- Added to `.gitignore` if stored in local config files

### Route Guard Coverage
For every route in the routing configuration:
- If the route serves authenticated content, does it have an `authGuard` or equivalent?
- Does the guard check authorisation (role/permission) in addition to authentication?
- Is there a redirect loop risk (guard redirects to a route that is also guarded)?

### Token Storage
| Storage | Risk | Recommendation |
|---|---|---|
| `localStorage` | Accessible by XSS | Prefer `httpOnly` cookies for sensitive tokens |
| `sessionStorage` | Accessible by XSS | Same risk as localStorage, cleared on tab close |
| Memory (service / signal) | Lost on refresh, not accessible by XSS | Safest for access tokens |
| `httpOnly` cookie | Not accessible by JS | Safest option; requires server cooperation |

### Sensitive Data in URLs
- Are user IDs, emails, or tokens passed as query parameters? (They appear in server logs and browser history.)
- Prefer POST body or headers over query parameters for sensitive values.

---

## Step 4 — Produce the Security Report

Write `SECURITY_REPORT.md` in the project root:

```markdown
# Security Audit Report — {date}

## Scope
{Files or folders audited}

## Executive Summary
{2–3 sentences on overall security posture}

## Findings

### 🔴 Critical (fix immediately — may indicate active vulnerability)

| # | File | Line | Issue | Remediation |
|---|---|---|---|---|
| 1 | `user.component.html` | 24 | `[innerHTML]` bound to unsanitised user input | Sanitise with `DomSanitizer` or render as plain text |

### 🟠 High (fix before next release)

| # | File | Line | Issue | Remediation |
|---|---|---|---|---|

### 🟡 Medium (fix in current sprint)

| # | File | Line | Issue | Remediation |
|---|---|---|---|---|

### 🟢 Low / Informational

| # | File | Line | Issue | Remediation |
|---|---|---|---|---|

## Dependency Vulnerabilities
{Summary output from `npm audit`}

## What Is Done Well
{Positive findings — e.g. all routes guarded, no hardcoded secrets, interceptors in place}

## Remediation Checklist
- [ ] {Finding 1}: {specific action with file and line reference}
- [ ] {Finding 2}: {specific action}
```

---

## Step 5 — Present to User

Summarise in chat:
- Count of findings by severity
- Top 2–3 most urgent issues with one-line descriptions
- Whether any `npm audit` vulnerabilities require immediate package updates
- Offer to fix critical/high severity findings directly if the user confirms

---

## Usage Examples

```
/angular-security-audit
→ Full audit of src/
```

```
/angular-security-audit
→ src/app/auth/
→ Focus: guard coverage and token storage
```

```
/angular-security-audit
→ src/app/comments/
→ Known concern: users submit rich text that is displayed to other users
```

```
/angular-security-audit
→ Full audit of src/
→ Compliance: OWASP ASVS Level 2
```
