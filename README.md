# Hermes Dashboard UI

Fristaad HTML/CSS/JS-frontend for Hermes Agent dashboard.

## Arkitektur

```
Browser (via Twingate)
  -> nginx reverse proxy :9120
    -> Hermes Dashboard API :9119 (oforandrad)
```

Den befintliga `hermes-dashboard.service` och `hermes-dashboard-proxy.service`
far fortsatta kor oforandrade. Den har frontenden hostas separat av den nginx
som deployas via `deploy/`-mappen i detta repo.

## Struktur

```
hermes-dashboard-custom/
  public/           # Statiska assets (index.html, builderad JS/CSS)
  src/              # Kallkod for anpassning (byggs till public/)
  config/           # Lokala installningar (exkluderade fran git)
  deploy/           # systemd-unit + nginx-konf + install-skript
  .github/
    workflows/
      deploy.yml    # GitHub Actions deploy till VPS
```

## Utveckling

1. Andra filer under `src/`
2. Bygg om: `npm run build` (om package.json finns) eller lagg till gang i public/
3. Commit & push till `main`
  - GitHub Actions bygger och deployar automatiskt via rsync over SSH

## Design-anpassning

Klona de filer som du vill anpassa (public/index.html, CSS, JS), andra dem
och pusha. Deploy sker automatiskt via GitHub Actions.

## Hostspecificerat

Denna README kan hostas och versionshanteras offentligt i syfte att dokumentera
uppbyggnaden, men produktionssecrets ska inte committas.
