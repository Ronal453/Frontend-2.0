@echo off
REM ============================================================================
REM Node Wrapper (nodew.cmd) para Plantopolis Frontend
REM Propósito: Permitir ejecutar comandos de Node.js y pruebas unitarias
REM (node --test) en máquinas Windows sin Node.js instalado localmente,
REM utilizando la imagen oficial node:20-alpine de Docker (igual que el Dockerfile).
REM ============================================================================
docker run --rm -v "%cd%:/app" -w /app node:20-alpine node %*
