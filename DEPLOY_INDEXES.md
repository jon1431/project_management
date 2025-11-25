# Deploy Firestore Indexes

## Automatic Index Deployment

Run this command to deploy all required Firestore indexes:

```bash
firebase deploy --only firestore:indexes
```

## Prerequisites

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase (if not done):
```bash
firebase init firestore
```
- Select your project: `project-managem`
- Keep default rules file: `firebase/firestore.rules`
- Keep default indexes file: `firebase/firestore.indexes.json`

## What Indexes Are Deployed

The following composite indexes will be created:

### Reports Collection
1. **Home Feed Query**: `status` + `visibility` + `createdAt DESC`
2. **Pending Reports**: `status` + `createdAt ASC`
3. **User Reports**: `authorId` + `createdAt DESC`
4. **Category Filter**: `category` + `status` + `createdAt DESC`

### Resources Collection
1. **Published Resources**: `isPublished` + `priority DESC` + `createdAt DESC`
2. **Category Resources**: `category` + `isPublished` + `createdAt DESC`

### Audit Log Collection
1. **Resource Audit**: `resourceType` + `resourceId` + `timestamp DESC`
2. **Moderator Audit**: `moderatorId` + `timestamp DESC`

## Manual Index Creation

If Firebase CLI doesn't work, you can create indexes manually:

1. Go to [Firestore Console](https://console.firebase.google.com/project/project-managem/firestore/indexes)
2. Click "Create Index"
3. Enter the collection and fields from the list above
4. Wait 1-2 minutes for index to build

## Verify Indexes

After deployment, verify indexes are active:
1. Go to: https://console.firebase.google.com/project/project-managem/firestore/indexes
2. All indexes should show status: "Enabled"

## Troubleshooting

### Error: "Firebase project not found"
Run: `firebase use project-managem`

### Error: "Permission denied"
Run: `firebase login --reauth`

### Indexes still not working
- Wait 2-3 minutes after deployment
- Check Firebase Console for index build status
- Clear browser cache and reload app
