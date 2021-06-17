# Setting up a Local Development Environment

If developing scripts and web applications that runs on top of the meveo platform (not working on meveo code itself), all that is needed is to run meveo, keycloak, and postgres from within docker.

## Prerequisite

1. [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. [Git](https://github.com/git-guides/install-git)

## Running the meveo container locally

1. Download the meveo [docker-compose.yml](https://github.com/meveo-org/meveo/blob/master/.devcontainer/docker-compose.yml) file.
2. Open a terminal (command prompt window or powershell) then navigate to the folder where the docker-compose.yml file was downloaded.
3. Run `docker-compose up -d`.  This should download the meveo, keycloak, and postgres docker images and run them.
4. Once the download is done (this should only happen on initial load), check the logs to make sure that meveo is done loading the application by checking the logs with: `docker logs -f --tail 10 meveo`;
5. Once the deployment is complete. Access the meveo admin page on your browser at: http://localhost:8080/meveo

> default login: meveo.admin/meveo

## Installing liquichain and webApprouter

1. Download [webapprouter v5.0](https://github.com/meveo-org/module-webapprouter/blob/master/meveo%20module/WEBAPPROUTER_version-0_5_0.json) and [liquichain](https://github.com/smichea/liquichain/blob/main/mv-modules/LIQUICHAIN_version-0_1.json) modules
2. Log in to meveo admin then navigate to: `Configuration > Modules`
3. Click on `Import From File`.
4. On the popup, click `Choose file` and select the `WEBAPPROUTER_version-0_5_0.json` file first.
5. Click `Open` then click `Upload`
6. On the modules table, click on `WEBAPPROUTER`.
7. Click the `Install` button.
8. Do step 3 to 7 to install `LIQUICHAIN_version-<latestVersion>.json` next.
9. Do step 3 to 7 to install `LIQUICHAIN_API_version-<latestVersion>.json` next.
10. The liquichain web application should now be accessible at: http://localhost:8080/meveo/rest/webapp/LIQUICHAIN.

## Other useful hints

Meveo can be used as a git repo so you can edit the scripts in your favorite editor.

To clone the meveo repository, use:
> git clone http://meveo.admin:meveo@localhost:8080/meveo/git/Meveo meveo-git

This command clones the meveo repository into the `meveo-git` folder.

If needed or desired, each of the generated web apps installed by webapprouter can be cloned and edited as well by using:
> git clone http://meveo.admin:meveo@localhost:8080/meveo/git/{MODULE_CODE}

Where `{MODULE_CODE}` is the code of the module that was generated. e.g. LIQUICHAIN
