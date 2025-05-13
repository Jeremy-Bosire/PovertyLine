# Database Seeding Scripts

This directory contains scripts to seed the database with test data for development and testing purposes.

## Available Seeds

- **Users**: Creates admin, provider, and regular users with various verification statuses
- **Profiles**: Creates user profiles with varying levels of completion
- **Regions**: Creates geographic regions with demographic and poverty data
- **Resources**: Creates resources in different categories and statuses
- **Applications**: Creates resource applications with different statuses

## Usage

To seed the database with test data, run the following command from the project root:

```bash
flask seed_db
```

To remove all seeded data:

```bash
flask unseed_db
```

## Seed Data Structure

### Users
- Admin users (2)
- Provider users (4) - with varying verification statuses
- Regular users (5) - with varying verification statuses

### Profiles
- Complete profile with all fields filled
- Partial profiles with varying levels of completion
- Provider organization profiles

### Regions
- Major cities (New York, Los Angeles, Chicago)
- Rural region (Appalachia)
- Test region (inactive)

### Resources
- Food resources
- Housing resources
- Healthcare resources
- Employment resources
- Education resources
- Childcare resources

### Applications
- Applications with different statuses (approved, pending, rejected, withdrawn)
- Applications with varying levels of need
- Applications with different document requirements

## Customizing Seeds

To modify the seed data, edit the corresponding files in the `seeds` directory:

- `users.py`: User seed data
- `profiles.py`: Profile seed data
- `regions.py`: Region seed data
- `resources.py`: Resource seed data
- `applications.py`: Application seed data

After making changes, run `flask seed_db` to apply the updated seed data.
