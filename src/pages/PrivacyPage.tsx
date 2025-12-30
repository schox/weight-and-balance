import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">1. Overview</h2>
            <p>
              This Privacy Policy explains how the Weight & Balance Calculator ("the Application") handles user information. We are committed to protecting your privacy and being transparent about our data practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">2. Information We Collect</h2>
            <p>
              <strong>The short answer: We don't collect any personal information.</strong>
            </p>
            <p className="mt-2">
              This Application operates entirely in your web browser. All data you enter (weights, fuel quantities, settings) is:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Processed locally on your device</li>
              <li>Never transmitted to any server</li>
              <li>Not stored persistently (data is cleared when you close the browser tab)</li>
              <li>Not shared with any third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">3. Cookies and Local Storage</h2>
            <p>
              This Application does not use cookies or persistent local storage. Your preferences and calculations are held in memory only during your active session.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">4. Analytics</h2>
            <p>
              This Application does not use any analytics services. We do not track:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Page views or usage patterns</li>
              <li>User demographics</li>
              <li>Device information</li>
              <li>IP addresses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">5. Third-Party Services</h2>
            <p>
              This Application does not integrate with any third-party services that would collect user data. The Application is self-contained and does not make external API calls.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">6. Hosting</h2>
            <p>
              This Application is hosted on Vercel. While Vercel may collect standard server logs (IP addresses, browser type, access times) as part of their hosting service, we do not access or use this data. Please refer to <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel's Privacy Policy</a> for more information about their data practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">7. Children's Privacy</h2>
            <p>
              This Application is intended for use by licensed pilots and student pilots. We do not knowingly collect information from children under 13 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">9. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact <a href="mailto:andrew@andrewschox.com" className="text-blue-600 hover:underline">andrew@andrewschox.com</a>.
            </p>
          </section>

          <section className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
            <h3 className="font-semibold text-green-800 mb-2">Summary</h3>
            <p className="text-green-700">
              Your privacy is fully protected when using this Application. We collect no personal data, use no cookies, and have no tracking. Everything you enter stays on your device and disappears when you close the page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
