# TODOS:

- [-] add embedding index for local db
- [-] modify email templates
- [-] fix google auth
- [-] change console.logs for logger
- [-] add auth to durable object
- [x] improve UX of song autocomplete
- [x] fix button layout shift
- [x] if the songIdx is the last song, player should be redirected to the results page
- [x] score is not being updated correctly
- [-] if player has autocomplete opened when time is up, it should close the autocomplete
- [x] ready button functionality
- [x] clicking icon triggers a wave animation, remove it.
- [-] create error page
- [-] once a game is done, users shouldn't be able to access that route
- [-] fix times up text  in games
- [-] add modal when deleting a challenge
- [-] move from upstash rate limiting to cloudflare rate limiting
- [-] move server island to a simple client side fetch
- [-] figure out why the selects in challenges table are loading slowly
- [-] filter songs with the same name
- [-] for random challenges, add at most 1 song from the same anime

landing page:

### cache notes:

- cloudflare respects cache headers set in the page but you need to create a rule for it.
- setting cache headers in a page or layout will apply to all pages in that layout.
