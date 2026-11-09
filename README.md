# Cygnus Rx

Prescriptions and laboratory requests for the clinic, from Cygnus Solutions.
You write the prescription, sign it, and send the PDF to the patient. It runs
on the clinic PC, a phone or a tablet as the same app, and works offline once
installed.

## Install it

Cygnus Rx lives at https://shinigami1235-creator.github.io/Cygnus-Rx/. Open
that address once on each device and install it.

- **PC, in Chrome or Edge:** click the install icon at the right end of the
  address bar, then Install. Cygnus Rx gets its own window and a Start menu
  entry.
- **Android phone or tablet, in Chrome:** open the menu, then Add to home
  screen, then Install.
- **iPhone or iPad, in Safari:** tap Share, then Add to Home Screen.

The first time, fill in Doctor and clinic: your name, PRC and PTR numbers,
clinic address and logo. They print on every prescription after that.

## Write a prescription

1. Type the patient's name. A returning patient's sex, age and address fill in
   by themselves.
2. Type each medicine's generic name and pick it from the list. Form, strength
   and route fill in where there is only one choice.
3. Fill in Dose, How often and How long. The sig line writes itself from them
   and can be edited by hand.
4. Sign, then click **Finish and send**.

On the PC the page on the right is the printed page, line for line. On a phone
or a tablet held upright, **Preview** at the bottom shows it.

Generic names come first and the brand goes in brackets after, as the
Generics Act asks. Quantities print with the number in words, such as
"#30 (thirty)", so a changed number shows.

Two options above the preview set how a short prescription sits on the page.
**Center on the page** moves it down from the top, and **Larger text when
there is room** makes the type up to a quarter bigger as long as it still fits
on the same number of pages.

A medicine you write often can be kept with **Add to favourites**. A group of
medicines you give together, such as the set after a laser session, can be
kept with **Save list as a set**. Both come back through **Add from
favourites**.

## Laboratory and imaging

**Add tests** opens the picker. Its tabs are Laboratory, X-ray, Ultrasound,
CT scan, MRI, Mammography, Other tests and Sets, and each tab lists one
category at a time down the left, such as Hematology or Leg and foot.

- **Search** looks across every tab at once and knows the short names, so
  "sgpt", "bua", "cxr", "wab" and "knee x" all find their test.
- **X-ray** parts open with their routine views ticked, such as AP and lateral
  for the knee, and the other views can be ticked as needed. Limbs ask for a
  side, and the request will not finish until one is picked.
- **CT and MRI** ask for plain, with contrast, or plain and with contrast.
- **Not on the list?** at the bottom of every list adds a test under the
  category you choose. It is kept on your list for next time, marked Yours.
- **Sets** adds a whole group at once: annual check-up, before surgery,
  isotretinoin before starting and monthly, hair loss, hormonal acne or PCOS,
  fever, diabetes follow-up, high blood pressure, thyroid, and first prenatal
  visit. Pregnancy tests are left out for a male patient. **Save these as a
  set** keeps your own.

The request prints on a page of its own after the prescription, with the same
header and signature, since the pharmacy keeps one page and the laboratory
keeps the other. It lists the clinical impression, the tests grouped
by category, and the patient preparation the tests need, such as 10 to 12
hours of fasting for a lipid profile or a full bladder for a KUB ultrasound.
Untick **Print patient preparation** to leave that out.

Every preparation line can be changed. On a request, edit a line, remove it
with ×, or add your own with **+ Add a line**, and the change is for that
patient only. Under Doctor and clinic, **Patient preparation** holds the usual
wording of each line for every request: change it there, or clear a line to
stop it printing, and **Original wording** puts it back.

The catalog holds 123 laboratory tests in 12 categories, 112 imaging parts
across X-ray, ultrasound, CT, MRI and mammography, and 15 other tests such as
ECG, 2D echo and spirometry. It lives in `web\js\tests.js`.

## Letterhead

Doctor and clinic has a Letterhead card with a live preview of the top of the
page. Add a logo puts in up to 4 images, such as a clinic logo and society
seals: the first goes on the left, the second on the right. Drag a logo on the
preview to move it, use the Size slider, or Left, Middle and Right to put it
back on a margin. The text keeps clear of logos on the left and right and goes
under a logo in the middle, and a long name goes on two lines rather than run
under a logo.

The text can be centred, left or right, with the name small, medium or large,
the name and specialty in capitals, and the phone and email as one short line
or as Contact Numbers: and Email Address: in bold. Each line can be hidden or
moved up and down. Clinic schedule lists each clinic in bold with its days and
hours under it, one under another or side by side.

A prescription already issued keeps the letterhead it was printed with. The
single logo of older versions becomes the first logo, with the text beside it.

## Medicines not on the list

Typing in Generic name opens a list of matching medicines from the starter
list, your own medicines and your favourites. Its last row, Add as a new
medicine, saves one that is not there, with its form, strengths, how it is
taken and what the quantity counts. It then fills in like any medicine on the
list, marked Yours, and the × beside it removes it. Your medicines are kept
with the rest of the data and go into the backup. They have no About card and
no warnings.

## Medicine notes and warnings

About on a medicine opens its card: class, coverage for antibiotics
(Gram +, Gram −, atypicals, anaerobes, MRSA, Pseudomonas), what it is used
for, off-label uses marked as such, pregnancy, breastfeeding, kidneys, when
not to use it, interactions and children's doses. Minoxidil, ketoconazole,
terbinafine and ivermectin have a separate card for the tablet, since the
cream's notes are wrong for it.

Find by condition searches the cards by condition, organism or class, so
"CAP", "melasma", "atypical" or "MRSA" lists the medicines that fit.

Each medicine shows a warning line when it clashes with another medicine on
the prescription, with what the patient takes regularly, with the allergy
box, with Pregnant or Breastfeeding, with the patient's age, or when two
medicines are from the same class. Red means avoid and yellow means caution.
A dangerous drug under RA 9165 asks for your S2 number and its own
prescription. Warnings never print and never stop a prescription.

With a weight typed, a syrup, suspension or drops shows the child's dose in
mg and mL for its strength, and Use puts that dose in the sig. Co-amoxiclav
and co-trimoxazole written as the total on the box, like 457 mg/5 mL, are
read as their two parts.

The notes come from product labels, the BNF, the Sanford Guide and LactMed,
dated in `web/js/druginfo.js` as CHECKED. On 3 Nov 2026 every medicine was
checked against its US label on DailyMed, or the UK label where it is not sold
in the US, since MIMS and PPD are not open to outside readers. Boxed warnings
show in red at the top of the card. They cover the starter list only. A medicine typed in that is
not on the list gets no card and no warnings.

## Certificates

The Certificate tab makes a medical certificate, a fit to work certificate or
a medical clearance on the same letterhead and signature. It shows only the
patient, the certificate and the signature, and keeps its own draft, so a
prescription half written in New prescription stays as it is. Add a
certificate under New prescription puts one on the prescription instead. The wording is
written from the boxes and the patient's details, and can be changed by hand.
A certificate can go out alone or after the prescription as its own page.

## Signing

You sign once and the signature is kept for every prescription after that.

- **Sign here** signs on the screen, with a pen, a finger or the mouse.
- **Type or photo** takes a typed name, or a photo of your signature on white
  paper.
- **Sign on tablet**, on the PC, sends the signature from a tablet's pen to the
  PC through Cygnus Rx Link.

## Cygnus Rx Link

Cygnus Rx needs no server. Cygnus Rx Link is a small program for the PC that
you open only for two things that go over the clinic wifi: signing on a tablet,
and sending a PDF to a patient's phone by QR code. Close its window when you
are done and it stops.

1. Double-click **Cygnus Rx Link** in the Cygnus Rx folder. A small window
   says it is on.
2. In Cygnus Rx, click **Sign on tablet**, or finish a prescription to get the
   patient's QR code.
3. Close the Cygnus Rx Link window afterwards.

The first time, Windows asks whether to let it use the network. Tick
**Private networks** and click Allow. Chrome may also ask whether Cygnus Rx can
look for devices on your network. Click Allow.

A tablet or phone on the wifi reaches only the signing page and the patient's
download page, from the code on the screen. Each link is a random
32-character code that stops working after 20 minutes for signing and 30
minutes for a patient's PDF, or when the window showing the code is closed.

## Send it to the patient

Finish and send opens the ways to send it.

- **Share by Viber, Messenger or email** opens the device's share menu with
  the PDF attached.
- **QR code**, on the PC with Cygnus Rx Link open: the patient joins the clinic
  wifi and points their phone camera at the code, the PDF downloads on their
  phone, and the window says when it has.
- **Download PDF** and **Print**. On a phone or a tablet, Open to print shows
  the PDF in the phone's own viewer, which prints.

## History

History lists every prescription with its date, Rx number, patient and how it
was sent. Open one to send it again, print it, or copy it into a new
prescription for a repeat visit. A reprint uses the logo, signature and
license numbers it was issued with.

## Where things are kept

Each device keeps its own records inside Cygnus Rx: patients, prescriptions,
favourites, signatures and your details. Chrome, Edge and Safari keep this
data unless the app is uninstalled or its site data is cleared, so download a
backup now and then.

| What | Where |
|---|---|
| Everything, on each device | Inside Cygnus Rx, under its web address |
| A copy you can carry | **Download backup** under Doctor and clinic, restored with **Restore from backup** |
| Every finished PDF, on the PC | The folder you pick under Doctor and clinic, with `Cygnus Rx backup.json` beside it |

Records do not move between devices by themselves. To carry everything from
the PC to the tablet, download a backup on one and restore it on the other.

On an iPhone or iPad, add the app to the home screen before using it, since
Safari clears a website's data after 7 days without a visit while an app on
the home screen keeps it.

## What it checks before finishing

- Your name is filled in under Doctor and clinic.
- The patient has a name, and it fits on its line.
- Every medicine has a generic name and a sig.
- Every X-ray, ultrasound, CT or MRI of a limb has a side.
- There is a signature, unless Sign this prescription is unticked.
- Every letter can print. The pad prints Latin letters only, so Thai
  letters print as question marks and are flagged.

## Not done yet

- Records kept in step between the PC, the phone and the tablet.
- Thai and other non-Latin letters on the printed page.
- The yellow S2 prescription for dangerous drugs. That form is the serialised
  DDB pad and is still written by hand.
- Sending the PDF by text message from the clinic Android phone, planned for
  Cygnus Clinic.

## Publishing

The app is the `web` folder: plain HTML, CSS and JavaScript with no build
step. GitHub Pages serves it from the `Cygnus-Rx` repository on the
shinigami1235-creator account, at
https://shinigami1235-creator.github.io/Cygnus-Rx/, with the contents of `web`
at the root of the repository and `web/public` left out. Cygnus Rx Link
accepts calls from that address and from https://cygnus-solutions.github.io,
and from localhost while the app is being built.

Before publishing a change, run `node scripts/build-web.mjs`. It writes
`web/sw.js`, the list of files the installed app keeps offline, under a version
taken from their contents, so every installed copy picks up the change on its
next start.

## For whoever builds it next

```
node scripts/build-web.mjs              # refreshes the offline file list in web/sw.js
sh scripts/build.sh                     # also builds Cygnus Rx Link.exe and its console copy
node scripts/winres.mjs                 # rebuilds the exe icon from app-icon.png
python3 -m http.server 8080 --directory web     # serves the app for testing
node tests/flow.mjs http://localhost:8080 http://127.0.0.1:7718   # with Link running
node tests/requests.mjs http://localhost:8080
node tests/layout.mjs http://localhost:8080
node tests/mobile.mjs http://localhost:8080      # phone and tablet sizes, no Link
node tests/prep.mjs http://localhost:8080        # editing the patient preparation lines
sh tests/security.sh 192.0.2.2 7718     # what the wifi and other web pages can reach
node scripts/lint-strings.mjs web/index.html web/js/*.js web/public/*.html README.md
```

`web/js/layout.js` lays out the prescription once in PDF points, and both the
preview and the PDF draw from it. `web/js/tests.js` holds the laboratory and
imaging catalog. `server-go/main.go` is Cygnus Rx Link.
