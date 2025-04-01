import os
import subprocess

# Setup Database

# Run the database setup script in 'backend/db_setup' --> 'database_setup.py'
subprocess.run(["python", "db_setup/database_setup.py"])

# Directory containing the Flask microservices
services_dir = "./"

# List to store the running processes
processes = []

# Iterate through the directories in the services directory
for filename in os.listdir(services_dir):
    if filename.endswith(".py") and filename != "app_runner.py":
        # Run the microservice through "python filename.py"
        process = subprocess.Popen(["python", os.path.join(services_dir, filename)])
        processes.append(process)

        print(f"Started {filename}")

# Wait for all the processes to finish
for process in processes:
    process.wait()


