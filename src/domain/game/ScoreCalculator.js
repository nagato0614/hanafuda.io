export function computeKoikoiMultiplier(selfStatus, opponentStatus) {
  const selfLevel = selfStatus?.koikoiLevel ?? 0;
  const opponentLevel = opponentStatus?.koikoiLevel ?? 0;
  const selfFactor = selfLevel > 0 ? 2 ** selfLevel : 1;
  const opponentFactor = opponentStatus?.koikoiDeclared ? 2 ** opponentLevel : 1;
  return selfFactor * opponentFactor;
}

export function computePlayerScore({ yakuList = [], selfStatus = {}, opponentStatus = {} }) {
  const basePoints = yakuList.reduce((sum, item) => sum + (item.points ?? 0), 0);
  const multiplier = basePoints > 0 ? computeKoikoiMultiplier(selfStatus, opponentStatus) : 1;
  return {
    base: basePoints,
    multiplier,
    total: basePoints * multiplier
  };
}

export function buildRoundPoints({ playerIds, yakuMap, statusMap, winnerId = null }) {
  const points = new Map();

  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    return points;
  }

  const totals = playerIds.map((playerId) => {
    const selfStatus = statusMap.get(playerId) ?? {};
    const opponentStatus = playerIds
      .filter((id) => id !== playerId)
      .map((id) => statusMap.get(id) ?? {})
      .reduce(
        (acc, status) => ({
          koikoiLevel: (acc.koikoiLevel ?? 0) + (status.koikoiLevel ?? 0),
          koikoiDeclared: Boolean(acc.koikoiDeclared || status.koikoiDeclared)
        }),
        { koikoiLevel: 0, koikoiDeclared: false }
      );

    const score = computePlayerScore({
      yakuList: yakuMap.get(playerId) ?? [],
      selfStatus,
      opponentStatus
    });

    return { playerId, score };
  });

  const positiveTotals = totals.filter((item) => item.score.total > 0);

  if (winnerId) {
    const winner = totals.find((item) => item.playerId === winnerId);
    if (winner) {
      points.set(winner.playerId, winner.score.total);
    }
    for (const { playerId } of totals) {
      if (playerId !== winnerId) {
        points.set(playerId, 0);
      }
    }
    return points;
  }

  if (positiveTotals.length === 0) {
    for (const { playerId } of totals) {
      points.set(playerId, 0);
    }
    return points;
  }

  const sorted = [...positiveTotals].sort((a, b) => b.score.total - a.score.total);
  const top = sorted[0];
  const second = sorted[1];

  if (!second || top.score.total > second.score.total) {
    for (const { playerId } of totals) {
      points.set(playerId, playerId === top.playerId ? top.score.total : 0);
    }
    return points;
  }

  // 引き分け
  for (const { playerId } of totals) {
    points.set(playerId, 0);
  }
  return points;
}
