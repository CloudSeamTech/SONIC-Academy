# Next improvements to the lab experience

Database work is paused while the learning interface is refined.

The current release simplifies duplicate lesson material, keeps safety and
recovery instructions visible before the walkthrough, moves long source lists
to References, and makes step navigation cream with near-black labels.
Screenshots remain inside their step, before the check and Next button.
Verification rules, routes, lesson IDs, and stored progress keys are retained.

## Implemented since this roadmap

Shared readers now offer optional step focus with reversible setup/notes visibility; Linux walkthroughs also provide focused Previous/Next navigation. Numbered picture callouts are available for reviewed source assets and all 35 steps of the new DMZ class. This does not mean every legacy image has reviewed marker coordinates or that illustrated screens are live captures.

## Further improvements

1. **A focused step view.** Keep the action, short explanation, screenshot,
   expected result, and navigation together. Put the exercise and knowledge
   check in a clearly named final stage rather than repeating wrap-up content
   beneath every intermediate step. Test that learners can still revisit their
   evidence and completed work.
2. **Predict, do, compare.** Before a meaningful command, ask a short question
   such as “Which server should answer this DNS request?” Then compare the
   learner's actual result with the expected observation and explain why.
   Do not present a self-checked box as automatic proof of execution.
3. **Numbered screen callouts.** Highlight the exact field or menu on the
   relevant screenshot. Explain version differences and provide keyboard or
   text alternatives. Preserve original references and label any recreated UI.
4. **Guided practice, then an independent challenge.** Teach a service fix
   step by step, then provide a similar deliberately broken practice scenario
   with fewer instructions. Use staged hints and a final explanation instead
   of giving away the whole answer immediately. Keep all changes inside the
   learner's approved lab.
5. **Resume and recovery checkpoints.** Resume the last viewed step separately
   from completion. Show prerequisites and a short “ready to continue” check.
   Offer a way to reset lesson notes without implying that it restores a VM.
6. **Real isolated practice environments later.** In-browser terminal and
   instruction panes can reduce switching between tools. That requires an
   isolated runtime per learner, verified checks, access controls, cleanup,
   and cost limits. The present website does not provide that infrastructure;
   the Windows companion and learner-owned labs remain the real-execution path.

## Patterns informing the recommendations

These are recommendations for SONIC-Academy, not claims that those sites have
identical features or that their infrastructure has been integrated here.

- KodeKloud explains hands-on playground environments:
  https://support.kodekloud.com/what-are-kodekloud-playgrounds
- Whizlabs distinguishes guided labs from independent sandbox exploration:
  https://www.whizlabs.com/blog/hands-on-labs-beginners-guide/
- QA describes instruction and exercise environments together with validations:
  https://support.platform.qa.com/hc/en-us/articles/203450859-Hands-on-Labs
