# ⚡ AGENT-OPS — høyhastighets fiks-modus (Monterosso)

Krin starter en agent per oppgave (eller ruter til en aktiv). En **vakt** sjekker kollisjon før hver utsendelse. Ingen to agenter i samme fil samtidig.

## Roller
- **Krin (dirigent)** — alltid i loopen. Tar imot oppgaver, starter/ruter agenter, holder CLAIMS levende, merger, deployer.
- **Vakt (kollisjons-sjekk)** — kjøres ved hver utsendelse: vetter den nye oppgavens mål-filer mot CLAIMS. Klart → start. Overlapp → foreslår split (del filer) eller sekvens (etter hverandre). Krin + berørt agent avgjør.
- **Oppgave-agenter** — én lane hver, låser filene sine i CLAIMS før de rører dem, logger i WORKLOG, committer ikke (Krin merger).

## Regler
1. Hver agent **claimer** sine filer i CLAIMS før den editerer. Aldri rør en `LÅST` fil andre eier.
2. Overlapp oppdaget → IKKE start; del filene eller sekvenser.
3. Mål: aldri to i samme fil samtidig.

## CLAIMS (levende — hvem eier hva nå)
| Fil/mappe | Agent | Status | Tid |
|---|---|---|---|
| _(ingen aktive oppgaver)_ | — | FRI | — |
