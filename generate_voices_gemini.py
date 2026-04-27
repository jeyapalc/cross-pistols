"""
Cross Pistols — Range Officer Voice Generation (Gemini TTS)
===========================================================
Uses Google Gemini 2.5 Flash TTS to generate 60 voice files
(6 voices × 10 scripts) with natural disfluency and emphasis.

Usage:
    python generate_voices_gemini.py

Outputs WAV files to: public/audio/{voice-key}/{script-key}.wav
"""

import os, sys, wave, struct

from google import genai
from google.genai import types

API_KEY = "AIzaSyDzfNrXDDvbcgLyF_KKZEY78RkSiVXs9gE"

client = genai.Client(api_key=API_KEY)

# ═══════════════════════════════════════════════════════════
# VOICE DEFINITIONS
# ═══════════════════════════════════════════════════════════
# Each voice has a Gemini prebuilt voice + a style prompt that
# steers the TTS delivery for the desired character.

VOICES = {
    'male-us': {
        'voice': 'Orus',
        'style': (
            'You are a seasoned American male range officer in his 40s. '
            'Speak with a calm, steady, authoritative baritone. Professional but approachable. '
            'Add natural pauses where you would breathe. '
            'When you say "Shooters, be alert" — slow down, lower your pitch, and deliver it '
            'with firm, commanding weight like a real warning.'
        ),
    },
    'female-us': {
        'voice': 'Aoede',
        'style': (
            'You are a confident young American woman in her late 20s with a smooth, warm, '
            'slightly sultry voice. Think controlled and alluring but still completely professional. '
            'Speak clearly with a natural cadence and subtle breathiness. '
            'When you say "Shooters, be alert" — make it sharp and intentional, a sudden shift '
            'from your smooth delivery to a crisp warning.'
        ),
    },
    'male-gb': {
        'voice': 'Fenrir',
        'style': (
            'You are a British male range officer with a crisp, precise military accent. '
            'Think Royal Marines instructor — clipped, efficient, no-nonsense. '
            'Deliver instructions with metronomic precision but natural breathing pauses. '
            'When you say "Shooters, be alert" — snap it out like a drill command.'
        ),
    },
    'female-gb': {
        'voice': 'Gacrux',
        'style': (
            'You are a mature, experienced British woman in her late 50s — a veteran instructor. '
            'Your voice carries gravitas, wisdom, and quiet authority. Speak slower than average. '
            'Think of a retired chief superintendent. Warm but commanding. '
            'When you say "Shooters, be alert" — pause before it, then deliver it with '
            'the weight of someone who has seen what happens when people are not alert.'
        ),
    },
    'male-au': {
        'voice': 'Charon',
        'style': (
            'You are a deep-voiced male with a rich, resonant bass-baritone. '
            'Speak with warmth, power, and a steady rhythm — like a veteran with '
            'a voice that fills the room naturally. Add natural pauses and gravitas. '
            'When you say "Shooters, be alert" — let your voice drop even lower '
            'and deliver it slowly with absolute conviction.'
        ),
    },
    'female-au': {
        'voice': 'Kore',
        'style': (
            'You are a clear, professional Australian woman. Confident, bright, and precise. '
            'Speak with natural Australian intonation — not exaggerated but unmistakable. '
            'Crisp consonants, rising terminals on questions only. '
            'When you say "Shooters, be alert" — punch it with sharp staccato emphasis.'
        ),
    },
}

# ═══════════════════════════════════════════════════════════
# SCRIPTS — Natural disfluency, no ALL CAPS, semicolons
# ═══════════════════════════════════════════════════════════
# Light disfluency: "..." for breath pauses, occasional filler.
# Emphasis markers in brackets for TTS steering.

SCRIPTS = {
    # ── AFQ Course ──
    'reg-s1': (
        'Shooters on the line... ready and holster your pistol. '
        'On the sound of the shot timer, you will have 30 seconds '
        'to draw from the holster and fire 4 rounds standing; '
        'safely move to kneeling, then fire 4 rounds kneeling — at 15 meters. '
        '[pause] Shooters... be alert.'
    ),
    'reg-s2': (
        'Shooters on the line... ready and holster your pistol. '
        'On the sound of the timer; issue the police challenge, '
        'draw from the holster, fire 2 rounds, followed by an emergency reload, '
        'then fire 2 more rounds. You have 10 seconds total. '
        '[pause] Shooters... be alert.'
    ),
    'reg-s3a': (
        'Shooters on the line. Draw from the holster; '
        'fire 1 round center mass, 1 round to the head... holster.'
    ),
    'reg-s3b': (
        'Shooters on the line. Draw from the holster; fire 2 rounds center mass, '
        '1 round to the head. Return to high-ready. '
        '[pause] Shooters... be alert.'
    ),
    'reg-s3c': (
        'Shooters on the line. From the high ready; fire 2 rounds center mass, '
        '2 rounds to the head. '
        '[pause] Shooters... be alert.'
    ),
    'reg-s4': (
        'Shooters on the line... ready and holster your pistol. '
        'On the sound of the shot timer, you will have 8 seconds '
        'to draw and fire 6 rounds — at 7 meters. '
        '[pause] Shooters... be alert.'
    ),

    # ── BFI Course ──
    'inst-s1': (
        'Shooters on the line... ready and holster your pistol. '
        'On the sound of the shot timer, you will have 22 seconds '
        'to draw from the holster and fire 4 rounds standing, '
        'then 4 rounds kneeling — at 15 meters. '
        '[pause] Shooters... be alert.'
    ),
    'inst-s2': (
        'Shooters on the line... ready and holster your pistol. '
        'On the sound of the shot timer, you will have 8 seconds '
        'to start from high ready; fire 2 rounds, conduct a reload, '
        'then fire 2 more rounds — at 7 meters. '
        '[pause] Shooters... be alert.'
    ),
    'inst-s3': (
        'Shooters on the line... ready and holster your pistol. '
        'On the sound of the shot timer, you will complete 3 repetitions; '
        'for each rep you have 5 seconds to draw from the holster '
        'and fire 2 centre mass and 1 head — at 5 meters. '
        '[pause] Shooters... be alert.'
    ),
    'inst-s4': (
        'Shooters on the line... ready and holster your pistol. '
        'On the sound of the shot timer, you will have 45 seconds '
        'to draw from the holster and fire 3 standing; '
        '3 standing from cover; and 3 kneeling from cover — at 25 meters. '
        '[pause] Shooters... be alert.'
    ),
}


def generate_audio(voice_key, voice_cfg, script_key, script_text):
    """Generate a single audio file via Gemini TTS."""

    # Combine style direction + script into a single prompt
    prompt = (
        f"{voice_cfg['style']}\n\n"
        f"Read the following range command aloud exactly as written. "
        f"Do not add words. Do not change the text. Just read it naturally "
        f"with the character voice described above:\n\n"
        f'"{script_text}"'
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_cfg['voice']
                    )
                )
            ),
        ),
    )

    # Extract audio bytes from response
    data = response.candidates[0].content.parts[0].inline_data.data
    mime = response.candidates[0].content.parts[0].inline_data.mime_type

    return data, mime


def save_audio(data, mime_type, filepath):
    """Save raw audio bytes to a WAV file."""
    # Gemini TTS returns audio/wav or audio/L16 at 24kHz
    # The data is already in WAV format with headers
    with open(filepath, 'wb') as f:
        f.write(data)


def main():
    total = len(VOICES) * len(SCRIPTS)
    n = 0
    errors = []

    print(f"Cross Pistols — Gemini TTS Voice Generation")
    print(f"{'='*50}")
    print(f"Generating {total} files ({len(VOICES)} voices × {len(SCRIPTS)} scripts)\n")

    for vk, vcfg in VOICES.items():
        d = os.path.join('public', 'audio', vk)
        os.makedirs(d, exist_ok=True)

        for sid, txt in SCRIPTS.items():
            n += 1
            # Output as .wav
            filepath = os.path.join(d, f'{sid}.wav')

            if os.path.exists(filepath):
                print(f'  [{n:02d}/{total}] SKIP {vk}/{sid} (exists)')
                continue

            print(f'  [{n:02d}/{total}] {vk}/{sid} ({vcfg["voice"]})...', end='', flush=True)

            try:
                data, mime = generate_audio(vk, vcfg, sid, txt)
                save_audio(data, mime, filepath)
                size_kb = len(data) / 1024
                print(f' OK ({size_kb:.0f} KB)')
            except Exception as e:
                print(f' FAIL: {e}')
                errors.append((vk, sid, str(e)))

    print(f"\n{'='*50}")
    print(f"Done! {total - len(errors)}/{total} files generated.")
    if errors:
        print(f"\n{len(errors)} errors:")
        for vk, sid, err in errors:
            print(f"  {vk}/{sid}: {err}")


if __name__ == '__main__':
    main()
