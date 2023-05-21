FROM node:lts-slim

RUN apt update && apt install -y \
    git gpg gnupg gpg-agent socat \
    ca-certificates \
    zsh \
    curl \
    wget \
    git \
    git-flow \
    fonts-powerline \
    procps 

RUN npm install -g @nestjs/cli@latest

USER node

RUN mkdir -p /home/node/backend/auth-svc

WORKDIR /home/node/backend/auth-svc

RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.2/zsh-in-docker.sh)" -- \
    -t https://github.com/romkatv/powerlevel10k \
    -p git \
    -p git-flow \
    -p https://github.com/zdharma-continuum/fast-syntax-highlighting \
    -p https://github.com/zsh-users/zsh-autosuggestions \
    -p https://github.com/zsh-users/zsh-completions \
    -a 'export TERM=xterm-256color'

RUN echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> ~/.zshrc && \
    echo 'HISTFILE=/home/node/zsh/.zsh_history' >> ~/.zshrc

CMD [".docker/start.sh"]