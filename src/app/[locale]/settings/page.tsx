
// Design: Settings page with theme support and dark mode compatibility
import { CompanyInfoModal } from './company-info-modal';
import { BusinessRulesModal } from './business-rules-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company information and application preferences.</p>
      </div>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Company Information Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                This information will be displayed on your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage your company details including registration numbers and bank information.
                </p>
                <CompanyInfoModal />
              </div>
            </CardContent>
          </Card>
          
          {/* Business Rules Card */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Business Rules</CardTitle>
              <CardDescription>
                Set default values for business logic like pricing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure default profit margins and VAT settings for your business.
                </p>
                <BusinessRulesModal />
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
