

import { PositionalAudio, Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { PositionalAudio as PAudio } from "three";
import { create } from "zustand";
import ScoreService from "./services/ScoreService";
import AuthService from "./services/AuthService";

export const useScoreStore = create((set) => ({
  score: 0,
  addScore: () => set((state) => {
    const newScore = state.score + 10;
    const user = AuthService.getCurrentUser();
    if (user) {
      ScoreService.saveScore(user.email, newScore); // Save or update the score
    }
    return { score: newScore };
  }),
}));

export const Score = () => {
  const formatScoreText = (score) => {
    const clampedScore = Math.max(0, Math.min(9999, score));
    return clampedScore.toString().padStart(4, "0");
  };
  const score = useScoreStore((state) => state.score);
  const soundRef = useRef(null);

  useEffect(() => {
    if (score > 0) {
      const scoreSound = soundRef.current;
      if (scoreSound.isPlaying) scoreSound.stop();
      scoreSound.play();
    }
  }, [score]);

  return (
    <Text
      color={0xffa276}
      font="assets/SpaceMono-Bold.ttf"
      fontSize={0.52}
      anchorX="center"
      anchorY="middle"
      position={[0, 0.67, -1.44]}
      quaternion={[-0.4582265217274104, 0, 0, 0.8888354486549235]}
    >
      {formatScoreText(score)}
      <PositionalAudio ref={soundRef} url="assets/score.ogg" loop={false} />
    </Text>
  );
};