FROM gradle:7-jdk11 AS build

COPY --chown=gradle:gradle . /home/gradle/src

WORKDIR /home/gradle/src

RUN gradle build --no-daemon

FROM openjdk:11 AS runner

RUN mkdir /app

COPY --from=build /home/gradle/src/build/libs/*.jar /app/taskana-core-bench.jar

ENTRYPOINT ["java","-jar","/app/taskana-core-bench.jar"]
