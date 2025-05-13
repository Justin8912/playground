FROM public.ecr.aws/lambda/nodejs:20

# Install Chrome dependencies
RUN yum install -y \
    alsa-lib \
    atk \
    cups-libs \
    gtk3 \
    ipa-gothic-fonts \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    pango \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-misc \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils \
    nss \
    liberation-fonts \
    wget \
    unzip

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package.json and package-lock.json
COPY hello-world/package*.json ./

# Install dependencies
RUN npm install

# Install Puppeteer with specific configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/opt/chrome/chrome

# Download and install Chrome
RUN mkdir -p /opt/chrome \
    && wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm \
    && yum install -y ./google-chrome-stable_current_x86_64.rpm \
    && rm google-chrome-stable_current_x86_64.rpm \
    && ln -s /usr/bin/google-chrome-stable /opt/chrome/chrome

# Copy the rest of the function code
COPY hello-world/ ./

# Build TypeScript code
RUN npm run compile

CMD [ "app.lambdaHandler" ]