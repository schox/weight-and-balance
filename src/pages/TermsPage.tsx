import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsPage: React.FC = () => {
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Terms and Conditions</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this Weight & Balance Calculator ("the Application"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">2. Intended Use</h2>
            <p>
              This Application is solely intended for use by <strong>Curtin Flying Club members</strong>. By using this Application, you acknowledge that you are a member of the Curtin Flying Club or have been authorised to use this tool.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">3. Purpose and Limitations</h2>
            <p>
              This Application is provided as a <strong>planning tool only</strong>. It is designed to assist pilots with weight and balance calculations but is not a substitute for official aircraft documentation.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The Application is for informational and educational purposes only</li>
              <li>No guarantee is made with regard to the accuracy or suitability of any information produced by this Application</li>
              <li>Results should always be verified against the official Pilot's Operating Handbook (POH)</li>
              <li>The pilot in command remains solely responsible for ensuring the aircraft is loaded within approved limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">4. Pilot Responsibility</h2>
            <p>
              <strong>Pilots are responsible for verifying all weight and balance calculations.</strong> Always refer to the current Pilot's Operating Handbook (POH) for the specific aircraft you are flying for definitive weight and balance information. The POH is the authoritative source for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Centre of gravity limits and envelope</li>
              <li>Maximum weights (takeoff, landing, ramp)</li>
              <li>Loading station arm positions</li>
              <li>Current aircraft empty weight and moment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">5. No Warranty</h2>
            <p>
              The Application is provided "as is" without warranty of any kind, express or implied. We do not warrant that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The Application will be error-free or uninterrupted</li>
              <li>The calculations will be accurate in all circumstances</li>
              <li>The Application will meet your specific requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">6. Aircraft Data Accuracy</h2>
            <p>
              Aircraft specifications in this Application are based on data provided at a specific point in time. Aircraft empty weight and balance data can change due to modifications, equipment changes, or reweighing. Always verify the current weight and balance data for the specific aircraft you intend to fly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Curtin Flying Club and the developers of this Application shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your use of or inability to use the Application</li>
              <li>Any errors or omissions in the Application's calculations</li>
              <li>Any decisions made based on information provided by the Application</li>
              <li>Any flight operations conducted using data from this Application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">8. User Responsibilities</h2>
            <p>As a user of this Application, you agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Verify all calculations against official aircraft documentation before flight</li>
              <li>Use the Application only for lawful purposes</li>
              <li>Not rely solely on this Application for flight safety decisions</li>
              <li>Report any errors or discrepancies you discover</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">9. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Continued use of the Application following any changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">10. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by the laws of Western Australia. Any disputes shall be subject to the exclusive jurisdiction of the courts of Western Australia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mt-6 mb-3">11. Contact</h2>
            <p>
              For questions regarding these Terms and Conditions, please contact <a href="mailto:andrew@andrewschox.com" className="text-blue-600 hover:underline">andrew@andrewschox.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
