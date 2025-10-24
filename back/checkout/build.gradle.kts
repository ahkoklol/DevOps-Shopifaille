import com.google.protobuf.gradle.id

plugins {
	kotlin("jvm") version "1.9.25"
	kotlin("plugin.spring") version "1.9.25"
	id("org.springframework.boot") version "3.5.7"
	id("io.spring.dependency-management") version "1.1.7"
	id("com.google.protobuf") version "0.9.4"
}

group = "com.shopifaille"
version = "0.0.1-SNAPSHOT"
description = "Checkout microservice for Shopifaille"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
}

extra["springGrpcVersion"] = "0.11.0"
val kotestVersion = "6.0.4"
val arrowVersion = "2.1.2"
val kotestArrowVersion = "2.0.0"
val mockkVersion = "1.14.6"
val oshaiLogVersion = "7.0.3"

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.arrow-kt:arrow-core:${arrowVersion}")
    implementation("io.grpc:grpc-services")
    implementation("io.grpc:grpc-kotlin-stub")
    implementation("io.grpc:grpc-protobuf")
    implementation("io.grpc:grpc-stub")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.springframework.grpc:spring-grpc-server-web-spring-boot-starter")
    implementation("io.github.oshai:kotlin-logging-jvm:${oshaiLogVersion}")
    testImplementation("io.kotest:kotest-runner-junit5-jvm:${kotestVersion}")
    testImplementation("io.kotest:kotest-assertions-core:${kotestVersion}")
    testImplementation("io.kotest:kotest-extensions-spring:${kotestVersion}")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
    testImplementation("io.kotest.extensions:kotest-assertions-arrow:${kotestArrowVersion}")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	// testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
	testImplementation("org.springframework.grpc:spring-grpc-test")
    testImplementation("io.mockk:mockk:${mockkVersion}")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

dependencyManagement {
	imports {
		mavenBom("org.springframework.grpc:spring-grpc-dependencies:${property("springGrpcVersion")}")
	}
}

kotlin {
	compilerOptions {
		freeCompilerArgs.addAll("-Xjsr305=strict")
	}
}

protobuf {
	protoc {
		artifact = "com.google.protobuf:protoc"
	}
	plugins {
		id("grpc") {
			artifact = "io.grpc:protoc-gen-grpc-java"
		}
        id("grpckt") {
            // Must use the full artifact path with the version and @jar suffix
            artifact = "io.grpc:protoc-gen-grpc-kotlin:jdk8@jar"
        }
	}
	generateProtoTasks {
		all().forEach {
			it.plugins {
				id("grpc") {
					option("@generated=omit")
				}
                id("grpckt") { }
                it.builtins {
                    id("kotlin")
                }
			}
		}
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}
