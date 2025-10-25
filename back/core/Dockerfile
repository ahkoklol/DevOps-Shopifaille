# Use the official Deno slim image, based on Alpine Linux
FROM denoland/deno:latest

# Set the working directory
WORKDIR /app

# Copy the core service files
# We copy the lock file and config file first for proper caching
COPY deno.json .
COPY deno.lock .
COPY main.ts .
COPY main_test.ts . 

# Optional: Run a caching step to download and cache dependencies now (if dependencies were remote)
# Since you have a lock file, dependencies should be resolved fast.
# We will use the 'deno run' command to execute your main entry point.
# You can use the "deno compile" feature for a truly minimal image, but simple 'deno run' is faster to set up.

# Run the main Deno file, which uses the add function
# We use the port 8080 as a standard default, although it's not explicitly defined in main.ts
EXPOSE 8080 

# Define the command to run the application using the lock file
CMD ["deno", "run", "--allow-net", "--lock=deno.lock", "main.ts"]