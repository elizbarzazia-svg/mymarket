import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'მომსახურების პირობები',
  description: 'Marketologi-ის მომსახურების პირობები.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-vip-text mb-3">
          იურიდიული
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-2">
          მომსახურების პირობები
        </h1>
        <p className="text-text-muted text-sm mb-10">
          ბოლო განახლება: 2026 წლის ივლისი
        </p>

        <div className="rounded-3xl bg-card-bg border border-border-subtle p-8 sm:p-10 flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              1. რა არის Marketologi
            </h2>
            <p className="text-text-muted leading-relaxed">
              Marketologi არის ონლაინ პლატფორმა, რომელიც აძლევს მომხმარებლებს
              საშუალებას განათავსონ და დაათვალიერონ ნივთების გასაყიდი
              განცხადებები. <strong className="text-text-primary">Marketologi
              არ არის</strong> ნასყიდობის გარიგების მხარე — ჩვენ მხოლოდ
              ვაკავშირებთ პოტენციურ მყიდველსა და გამყიდველს ერთმანეთთან.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              2. გადახდა და მიწოდება
            </h2>
            <p className="text-text-muted leading-relaxed">
              ნასყიდობის ფასზე, გადახდის ფორმასა და მიწოდებაზე
              მომხმარებლები — მყიდველი და გამყიდველი — თანხმდებიან
              <strong className="text-text-primary"> პირდაპირ, ერთმანეთს
              შორის</strong>, Marketologi-ის მონაწილეობის გარეშე. Marketologi არ
              ამუშავებს გადახდებს ნივთების ნასყიდობისთვის და არ იძლევა
              გარანტიას გარიგების წარმატებით დასრულებაზე, ნივთის ხარისხზე,
              უსაფრთხოებაზე ან კანონიერებაზე.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              3. ანგარიში და პასუხისმგებლობა
            </h2>
            <p className="text-text-muted leading-relaxed">
              ანგარიშის შექმნისას ვალდებული ხართ მიუთითოთ ზუსტი ინფორმაცია.
              თქვენ პასუხისმგებელი ხართ თქვენს ანგარიშზე განთავსებულ ყველა
              განცხადებაზე, მათ სისწორესა და კანონიერებაზე. აკრძალულია:
            </p>
            <ul className="list-disc list-inside text-text-muted leading-relaxed mt-3 flex flex-col gap-1">
              <li>უკანონო, მოპარული ან საშიში ნივთების განთავსება</li>
              <li>ყალბი ან შეცდომაში შემყვანი ინფორმაციის მითითება</li>
              <li>სხვისი ვინაობის მითვისება ან თაღლითობა</li>
              <li>სხვა მომხმარებლების შევიწროება ან შეურაცხყოფა</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              4. VIP და ფასიანი ფუნქციები
            </h2>
            <p className="text-text-muted leading-relaxed">
              VIP სტატუსი ანიჭებს განცხადებას მეტ ხილვადობას. ამჟამად
              საიტზე VIP-ის გააქტიურება არ საჭიროებს რეალურ გადახდას
              (ტესტ რეჟიმი) — ეს შეიძლება შეიცვალოს მომავალში, რის
              შესახებაც მომხმარებლები წინასწარ იქნებიან ინფორმირებული.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              5. საკომისიო
            </h2>
            <p className="text-text-muted leading-relaxed">
              წარმატებით დასრულებულ გაყიდვაზე Marketologi იტოვებს
              გაყიდვის ფასის <strong className="text-text-primary">7%-ს</strong>{' '}
              საკომისიოს სახით. საკომისიოს ავტომატური დაკავება ამოქმედდება
              ონლაინ გადახდის სისტემის ჩართვის შემდეგ — მანამდე, სანამ
              გარიგება პირდაპირ, პლატფორმის გარეთ ხდება, საკომისიო
              ფაქტობრივად არ იკავება. საკომისიოს ოდენობა შეიძლება
              შეიცვალოს, რის შესახებაც გამყიდველები წინასწარ იქნებიან
              ინფორმირებული.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              6. პასუხისმგებლობის შეზღუდვა
            </h2>
            <p className="text-text-muted leading-relaxed">
              Marketologi გთავაზობთ პლატფორმას „როგორც არის" (as-is) და არ
              არის პასუხისმგებელი მომხმარებლებს შორის წარმოშობილ დავებზე,
              ზიანზე ან დანაკარგზე, რომელიც დაკავშირებულია პლატფორმაზე
              განთავსებულ განცხადებებთან ან შემდგომ გარიგებებთან.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              7. ანგარიშისა და განცხადებების მოხსნა
            </h2>
            <p className="text-text-muted leading-relaxed">
              Marketologi იტოვებს უფლებას წაშალოს ან შეაჩეროს ანგარიში ან
              განცხადება, რომელიც არღვევს ამ პირობებს, გაფრთხილების
              გარეშე.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              8. ცვლილებები
            </h2>
            <p className="text-text-muted leading-relaxed">
              შესაძლოა დროდადრო განვაახლოთ ეს პირობები. მნიშვნელოვანი
              ცვლილებების შემთხვევაში შეგატყობინებთ საიტის მეშვეობით.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              9. კონტაქტი
            </h2>
            <p className="text-text-muted leading-relaxed">
              კითხვების შემთხვევაში დაგვიკავშირდით ჩვენი მხარდაჭერის
              მეშვეობით.
            </p>
          </section>
        </div>

        <p className="text-xs text-text-muted mt-8 leading-relaxed">
          ⚠️ ეს გვერდი წარმოადგენს ზოგად თარგმანს/შაბლონს და არ არის
          იურისტის მიერ შედგენილი იურიდიული დოკუმენტი. რეალურ
          გამოქვეყნებამდე რეკომენდებულია საქართველოს კანონმდებლობაში
          გათვითცნობიერებულ იურისტთან კონსულტაცია.
        </p>

        <Link
          href="/privacy"
          className="inline-block mt-6 text-sm font-medium text-vip-text hover:underline"
        >
          კონფიდენციალურობის პოლიტიკა →
        </Link>
      </div>
    </div>
  );
}