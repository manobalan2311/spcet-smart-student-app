@ECHO OFF
SETLOCAL

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR%"=="" SET "MAVEN_PROJECTBASEDIR=."
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
SET "PROXY_HOST=127.0.0.1"
SET "PROXY_PORT=9999"

IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Maven wrapper JAR not found. Downloading...
  POWERSHELL -NoProfile -ExecutionPolicy Bypass -Command "$proxy='http://%PROXY_HOST%:%PROXY_PORT%'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%WRAPPER_URL%' -Proxy $proxy -OutFile '%WRAPPER_JAR%'"
  IF ERRORLEVEL 1 (
    ECHO Failed to download Maven wrapper JAR.
    EXIT /B 1
  )
)

IF "%JAVA_HOME%"=="" (
  SET "JAVA_EXE=java"
) ELSE (
  SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR% -Dhttp.proxyHost=%PROXY_HOST% -Dhttp.proxyPort=%PROXY_PORT% -Dhttps.proxyHost=%PROXY_HOST% -Dhttps.proxyPort=%PROXY_PORT% -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
EXIT /B %ERRORLEVEL%
