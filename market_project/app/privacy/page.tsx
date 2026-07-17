import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'კონფიდენციალურობის პოლიტიკა',
  description: 'Marketologi-ის კონფიდენციალურობის პოლიტიკა.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-vip-text mb-3">
          იურიდიული
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-2">
          კონფიდენციალურობის პოლიტიკა
        </h1>
        <p className="text-text-muted text-sm mb-10">
          ბოლო განახლება: 2026 წლის ივლისი
        </p>

        <div className="rounded-3xl bg-card-bg border border-border-subtle p-8 sm:p-10 flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              1. რა მონაცემებს ვაგროვებთ
            </h2>
            <ul className="list-disc list-inside text-text-muted leading-relaxed flex flex-col gap-1">
              <li>ელფოსტა და პაროლი (ავტორიზაციისთვის)</li>
              <li>სახელი, თუ მიუთითეთ პროფილში</li>
              <li>ტელეფონის ნომერი, რომელსაც ამატებთ განცხადებაზე</li>
              <li>ატვირთული ფოტოები და განცხადების ტექსტი</li>
              <li>ენის პრეფერენცია (ინახება მხოლოდ თქვენს ბრაუზერში)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              2. როგორ ვიყენებთ მონაცემებს
            </h2>
            <p className="text-text-muted leading-relaxed">
              მონაცემებს ვიყენებთ ანგარიშის შექმნის, სისტემაში შესვლის,
              განცხადებების გამოსაქვეყნებლად და დასანახად. თქვენი
              ტელეფონის ნომერი ხილვადი ხდება მხოლოდ იმ მომხმარებლისთვის,
              ვინც პირდაპირ დააჭერს „ნომრის ჩვენების" ღილაკს თქვენს
              განცხადებაზე.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              3. მონაცემთა შენახვა
            </h2>
            <p className="text-text-muted leading-relaxed">
              თქვენი მონაცემები ინახება Supabase-ის მეშვეობით (მონაცემთა
              ბაზისა და ავთენტიფიკაციის სერვისი), რომელიც მოქმედებს როგორც
              ჩვენი მონაცემთა დამმუშავებელი. ჩვენ არ ვყიდით და არ
              ვუზიარებთ თქვენს პირად მონაცემებს მესამე მხარეს
              სარეკლამო მიზნებისთვის.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              4. Cookies და ლოკალური შენახვა
            </h2>
            <p className="text-text-muted leading-relaxed">
              ვიყენებთ ბრაუზერის ლოკალურ საცავს (localStorage) მხოლოდ
              თქვენი ენის არჩევანის დასამახსოვრებლად. ავტორიზაციისთვის
              საჭირო სესიის მონაცემებიც ბრაუზერში ინახება Supabase Auth-ის
              მეშვეობით.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              5. თქვენი უფლებები
            </h2>
            <p className="text-text-muted leading-relaxed mb-3">
              შეგიძლიათ ნებისმიერ დროს:
            </p>
            <ul className="list-disc list-inside text-text-muted leading-relaxed flex flex-col gap-1">
              <li>ნახოთ და განაახლოთ თქვენი პროფილის ინფორმაცია Settings-იდან</li>
              <li>წაშალოთ თქვენი განცხადებები Dashboard-იდან</li>
              <li>
                მოითხოვოთ ანგარიშის სამუდამო წაშლა — ამჟამად ეს ავტომატურად
                არ ხდება, გთხოვთ დაგვიკავშირდეთ მხარდაჭერის მეშვეობით
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              6. ცვლილებები ამ პოლიტიკაში
            </h2>
            <p className="text-text-muted leading-relaxed">
              შესაძლოა დროდადრო განვაახლოთ ეს პოლიტიკა. მნიშვნელოვანი
              ცვლილებების შემთხვევაში შეგატყობინებთ საიტის მეშვეობით.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              7. კონტაქტი
            </h2>
            <p className="text-text-muted leading-relaxed">
              კონფიდენციალურობასთან დაკავშირებული ნებისმიერი კითხვისთვის
              დაგვიკავშირდით ჩვენი მხარდაჭერის მეშვეობით.
            </p>
          </section>
        </div>

        <p className="text-xs text-text-muted mt-8 leading-relaxed">
          ⚠️ ეს გვერდი წარმოადგენს ზოგად შაბლონს და არ არის იურისტის
          მიერ შედგენილი დოკუმენტი. საქართველოში პერსონალურ მონაცემთა
          დაცვის კანონმდებლობასთან შესაბამისობის დასადასტურებლად
          რეკომენდებულია იურისტთან კონსულტაცია რეალურ გამოქვეყნებამდე.
        </p>

        <Link
          href="/terms"
          className="inline-block mt-6 text-sm font-medium text-vip-text hover:underline"
        >
          ← მომსახურების პირობები
        </Link>
      </div>
    </div>
  );
}