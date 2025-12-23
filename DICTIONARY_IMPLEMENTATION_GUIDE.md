# Dictionary Implementation Guide

## Overview
This guide explains how to use the newly added dictionary entries to replace hardcoded strings in components.

## Quick Reference

### Common Actions (Buttons)
```typescript
import { getDictionary } from '@/lib/dictionaries';

export function MyComponent({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) {
  return (
    <Button>{dictionary.common.save}</Button>
    <Button>{dictionary.common.cancel}</Button>
    <Button>{dictionary.common.delete}</Button>
    <Button>{dictionary.common.update}</Button>
  );
}
```

### Supplier Dialog
```typescript
// Before (hardcoded):
<DialogTitle>Add New Supplier</DialogTitle>
<Label>Supplier Name</Label>

// After (using dictionary):
<DialogTitle>{dictionary.addSupplierDialog.title}</DialogTitle>
<Label>{dictionary.addSupplierDialog.supplierName}</Label>
```

### Customer Dialog
```typescript
<DialogTitle>{dictionary.addCustomerDialog.title}</DialogTitle>
<Label>{dictionary.addCustomerDialog.customerName}</Label>
<Input placeholder={dictionary.addCustomerDialog.customerNamePlaceholder} />
```

### User Management
```typescript
// For add user dialog
<DialogTitle>{dictionary.userManagement.addUserDialog.title}</DialogTitle>
<Label>{dictionary.userManagement.addUserDialog.userName}</Label>
<SelectItem value="Admin">{dictionary.userManagement.addUserDialog.roleAdmin}</SelectItem>

// For edit user dialog
<DialogTitle>{dictionary.userManagement.editUserDialog.title}</DialogTitle>
<Label>{dictionary.userManagement.editUserDialog.name}</Label>
```

### Toast Messages
```typescript
import { useToast } from '@/hooks/use-toast';

export function MyComponent({ dictionary }: Props) {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: dictionary.common.success,
      description: dictionary.addSupplierDialog.addSuccess,
    });
  };

  const handleError = () => {
    toast({
      title: dictionary.common.error,
      description: dictionary.addSupplierDialog.addError,
    });
  };
}
```

### Validation Messages
```typescript
const schema = z.object({
  supplierName: z.string().min(3, dictionary?.addSupplierDialog?.validationNameMinLength),
  email: z.string().email(dictionary?.addSupplierDialog?.validationEmailRequired),
  phone: z.string(dictionary?.addSupplierDialog?.validationPhoneRequired),
});
```

### Access Rights
```typescript
<DialogTitle>{dictionary.accessRights.title}</DialogTitle>
<DialogDescription>{dictionary.accessRights.description}</DialogDescription>

// Success
toast({
  title: dictionary.common.success,
  description: dictionary.accessRights.createSuccess.replace('[name]', accessRightName),
});
```

### Profile Modal
```typescript
<DialogTitle>{dictionary.profileModal.title}</DialogTitle>
<DialogDescription>{dictionary.profileModal.description}</DialogDescription>
<Label>{dictionary.profileModal.displayName}</Label>
```

### Billing Panel
```typescript
<p className="text-sm">
  {dictionary.billingPanel.plan} <strong>{profile?.subscription}</strong>
</p>
<p className="text-sm">
  {dictionary.billingPanel.expires}: {expiryDate}
</p>
<Button>{dictionary.billingPanel.renewButton}</Button>
```

### Settings
```typescript
<FormLabel>{dictionary.settings.defaultProfitMargin}</FormLabel>

// When saving
const buttonText = isLoading ? dictionary.settings.savingAndUpdating : dictionary.common.save;
```

## Usage Patterns

### Pattern 1: Simple Text Replacement
```typescript
// Replace: "Cancel"
// With:
{dictionary.common.cancel}
```

### Pattern 2: Form Labels
```typescript
// Replace: <Label>Supplier Name</Label>
// With:
<Label>{dictionary.addSupplierDialog.supplierName}</Label>
```

### Pattern 3: Dialog Titles
```typescript
// Replace: <DialogTitle>Add New Supplier</DialogTitle>
// With:
<DialogTitle>{dictionary.addSupplierDialog.title}</DialogTitle>
<DialogDescription>{dictionary.addSupplierDialog.description}</DialogDescription>
```

### Pattern 4: Dynamic Messages with Placeholders
```typescript
// For messages with dynamic content:
const message = dictionary.userManagement.editUserDialog.updateSuccess
  .replace('[name]', userName);

toast({
  title: dictionary.common.success,
  description: message,
});
```

### Pattern 5: Conditional Strings
```typescript
const buttonText = isLoading 
  ? dictionary.common.processing 
  : dictionary.common.save;

return <Button>{buttonText}</Button>;
```

### Pattern 6: Placeholder Attributes
```typescript
<Input 
  placeholder={dictionary.addSupplierDialog.supplierNamePlaceholder}
  {...field}
/>
```

### Pattern 7: Select Options
```typescript
<SelectItem value="trial">
  {dictionary.userManagement.addUserDialog.subscriptionTrial}
</SelectItem>
<SelectItem value="premium">
  {dictionary.userManagement.addUserDialog.subscriptionPremium}
</SelectItem>
```

## Component Checklist

Replace hardcoded strings in these components:

### Suppliers
- [ ] `src/components/dashboard/add-supplier-dialog.tsx`
- [ ] `src/components/dashboard/edit-supplier-dialog.tsx`

### Customers
- [ ] `src/components/dashboard/add-customer-dialog.tsx`
- [ ] `src/components/dashboard/edit-customer-dialog.tsx`

### User Management
- [ ] `src/components/admin/create-user-dialog.tsx`
- [ ] `src/components/admin/edit-user-dialog.tsx`

### Access Rights
- [ ] `src/components/admin/create-access-right-dialog.tsx`

### Profile & Settings
- [ ] `src/app/[locale]/settings/user-profile-modal.tsx`
- [ ] `src/app/[locale]/settings/profile-section.tsx`
- [ ] `src/components/dashboard/billing-panel.tsx`
- [ ] `src/app/[locale]/settings/profit-margin-form.tsx`
- [ ] `src/app/[locale]/settings/business-rules-modal.tsx`

### Other Components
- [ ] Any component using hardcoded: "Cancel", "Save", "Delete", "Close", etc.
- [ ] Any form validation error messages
- [ ] Any toast/notification messages

## Type Safety Tips

### Proper Typing
```typescript
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/lib/config';

export function MyComponent({ 
  dictionary, 
  locale 
}: { 
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  locale: Locale;
}) {
  // dictionary is fully typed and will show autocomplete
  return <div>{dictionary.common.save}</div>;
}
```

### Avoiding Type Errors
```typescript
// ✅ Good - proper path
dictionary.addSupplierDialog.supplierName

// ❌ Bad - misspelled key
dictionary.addSupplierDialg.supplierName  // TypeScript will catch this

// ✅ Good - fallback for optional
{dictionary?.addSupplierDialog?.supplierName || 'Supplier Name'}
```

## Testing After Updates

### 1. Build Verification
```bash
npm run build
```

### 2. Development Mode
```bash
npm run dev
```

### 3. Language Testing
- Test English (en)
- Test Arabic (ar) - Check RTL layout
- Test French (fr)

### 4. Component Testing
- Open each dialog that was updated
- Verify all text displays correctly
- Check RTL languages render properly
- Verify placeholders show correctly

### 5. TypeScript Check
```bash
npm run type-check
```

## Common Mistakes to Avoid

❌ **Don't** forget to import dictionary
```typescript
// Wrong - won't have access to dictionary
export function MyComponent() {
  return <div>{dictionary.common.save}</div>;
}
```

✅ **Do** pass dictionary as prop
```typescript
export function MyComponent({ dictionary }: { dictionary: Dictionary }) {
  return <div>{dictionary.common.save}</div>;
}
```

---

❌ **Don't** use hardcoded strings in error messages
```typescript
// Wrong
toast({ description: "Failed to add supplier" });
```

✅ **Do** use dictionary entries
```typescript
// Right
toast({ description: dictionary.addSupplierDialog.addError });
```

---

❌ **Don't** forget optional chaining for nested keys
```typescript
// Wrong - could be undefined
dictionary.addSupplierDialog.supplierName
```

✅ **Do** use optional chaining
```typescript
// Right
dictionary?.addSupplierDialog?.supplierName
```

## Performance Notes

- Dictionary objects are loaded once at the page level
- Passing dictionary through props is efficient
- No additional API calls needed
- All strings are pre-loaded

## Maintenance

When adding new components:

1. Add new dictionary keys following the existing pattern
2. Update all three language files (en.json, ar.json, fr.json)
3. Use consistent naming conventions
4. Document the new keys in this guide

---

**Last Updated**: December 23, 2025
**Version**: 1.0
