// longest increasing unique sequence
const getLIS = (nums: readonly number[]) => {
  if (!nums.length) return []
  const sequences = [[nums[0]]]

  for (let i = 1; i < nums.length; ++i) {
    const num = nums[i]
    if (num === undefined) continue

    for (let j = sequences.length - 1; j >= 0; --j) {
      const sequence = sequences[j]

      if (num < sequence[sequence.length - 1]) {
        if (j) continue
        else sequences.splice(0, 1, [num])
      } else {
        sequences.splice(j + 1, 1, [...sequence, num])
      }
      break
    }
  }

  return sequences.pop()
}

export {
  getLIS
}
