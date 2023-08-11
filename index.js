const fs = require("fs");
const _ = require("lodash");
const axios = require("axios");

class DopplerSecretsPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      "create-dotenv": {
        usage: "Fetch secrets from Doppler API and create .env file",
        lifecycleEvents: ["run"],
      },
    };

    this.hooks = {
      "create-dotenv:run": () => this.fetchDopplerSecrets(),
    };
  }

  async fetchDopplerSecrets() {
    const secrets = await this.getDopplerSecrets();

    const projectRoot = process.cwd();
    const envFilePath = `${projectRoot}/.env`;

    // Check if .env file exists and update it
    if (fs.existsSync(envFilePath)) {
      this.updateEnvFile(envFilePath, secrets);
      this.serverless.cli.log(".env file updated.");
    } else {
      this.createEnvFile(envFilePath, secrets);
      this.serverless.cli.log(".env file created.");
    }

    this.serverless.cli.log("Doppler secrets fetched, exported and saved on local .env file.");
    this.serverless.cli.log(Object.entries(secrets));
  }

  updateEnvFile(filePath, secrets) {
    let envContents = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";

    Object.entries(secrets).forEach(([key, value]) => {
      const regex = new RegExp(`^\\s*${key}=.*$`, "m");
      const newLine = `${key}='${value}'`;

      if (envContents.match(regex)) {
        envContents = envContents.replace(regex, newLine);
      } else {
        envContents += `${newLine}\n`;
      }
    });

    fs.writeFileSync(filePath, envContents, "utf-8");
  }

  createEnvFile(filePath, secrets) {
    const envContents = Object.entries(secrets)
      .map(([key, value]) => `${key}='${value}'`)
      .join("\n");

    fs.writeFileSync(filePath, envContents, "utf-8");
  }

  async getDopplerSecrets() {
    const projectName = this.getConfig("projectName", null);
    const environmentSlug = this.getConfig("environmentSlug", null);
    const dopplerToken = this.getConfig("dopplerToken", null);

    const response = await axios.get("https://api.doppler.com/v3/configs/config/secrets/download", {
      params: {
        format: "json",
        project: projectName,
        config: environmentSlug,
        include_dynamic_secrets: "false",
        include_managed_secrets: "true",
      },
      headers: {
        accept: "application/json",
        accepts: "application/json",
        authorization: `Bearer ${dopplerToken}`,
      },
    });
    return response.data;
  }

  getConfig(field, defaultValue) {
    return _.get(this.serverless, `service.custom.doppler.${field}`, defaultValue);
  }
}

module.exports = DopplerSecretsPlugin;
