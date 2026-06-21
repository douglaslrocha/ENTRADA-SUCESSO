---
description: Deploy automático de app na VPS via Coolify com configuração de DNS na Hostinger
---

Deploy Automático com Coolify e DNS Manual
Este workflow automatiza o deploy de aplicações web em uma VPS usando o Coolify, com a configuração de DNS sendo feita manualmente na Hostinger.
✅ Pré-requisitos
Repositório GitHub remoto atualizado.
Dockerfile na raiz do projeto ou subpasta.
IP da VPS e UUIDs do Servidor/Projeto Coolify (o Antigravity buscará isso via MCP).
�� Passos do Workflow
1. Sincronização com GitHub
// turbo Garantir que o código local está no GitHub.
git add .
git commit -m &quot;Preparando para deploy&quot;
git push origin main

2. Criar Aplicação no Coolify
Se for um novo app:
O Antigravity usará coolify-mcp_application com action=&#39;create_github&#39;.
Configuração: build_pack=&#39;dockerfile&#39;, ports_exposes=&#39;80&#39;.
3. Deploy Inicial
O Antigravity iniciará o deploy com coolify-mcp_deploy.
Monitoramento via coolify-mcp_deployment até o status finished.
4. Configurar DNS Manual (Hostinger)
Ação do Usuário: Como o MCP da Hostinger não está disponível, você deve:
Acessar o Painel da Hostinger -> DNS / Nameservers.
Criar um Registro tipo A.
Nome: O subdomínio (ex: app) ou @ para o domínio principal.
Aponta para (IP): O IP da sua VPS (o Antigravity informará qual é).
5. Configurar Domínio e SSL no Coolify
O Antigravity DEVE tentar atualizar o campo fqdn automaticamente via coolify- mcp_application.
Fallback Proativo: Se a atualização automática via MCP falhar (ex: erro de validação), o Antigravity deve avisar o usuário imediatamente e fornecer o link direto para a página de configuração do App no Coolify: https://[IP-DA-VPS]:8000/project/[PROJECT- UUID]/environment/[ENV-NAME]/application/[APP-UUID]#configuration.
Ação Manual: No campo Domains, cole a URL completa com HTTPS (ex: https://seu-dominio.com), clique em Save e em seguida em Redeploy.
�� Validação
Acesse a URL final com HTTPS e confirme se o site está online.
