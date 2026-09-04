package com.example.util

import com.example.data.remote.model.RawgRequirementsDto
import com.example.domain.model.PcRequirements

object PcRequirementsParser {

  private val MARKER_SYNONYMS = listOf(
    "OS" to listOf("OS", "Operating System"),
    "Processor" to listOf("Processor", "CPU", "Processor / CPU"),
    "Memory" to listOf("Memory / RAM", "Memory", "RAM"),
    "Graphics" to listOf("Graphics / GPU", "Graphics Card", "Graphics", "Video Card", "GPU"),
    "VRAM" to listOf("VRAM", "Video Memory"),
    "DirectX" to listOf("DirectX", "DirectX Version"),
    "Storage" to listOf("Storage", "Hard Drive", "Available Space", "Disk Space", "Hard Disk Space"),
    "Sound" to listOf("Sound Card", "Sound", "Audio"),
    "Notes" to listOf("Additional Notes", "Other Requirements", "Notes")
  )

  fun parse(rawReq: Any?): PcRequirements? {
    if (rawReq == null) return null

    var minRaw: String? = null
    var recRaw: String? = null

    when (rawReq) {
      is RawgRequirementsDto -> {
        minRaw = rawReq.minimum
        recRaw = rawReq.recommended
      }
      is com.example.data.remote.model.VeyloraRawRequirementsDto -> {
        minRaw = rawReq.minimum
        recRaw = rawReq.recommended
      }
      is Map<*, *> -> {
        minRaw = rawReq["minimum"]?.toString()
        recRaw = rawReq["recommended"]?.toString()
      }
      is String -> {
        val cleaned = cleanHtml(rawReq)
        val recIdx = cleaned.indexOf("Recommended:", ignoreCase = true)
        if (recIdx != -1) {
          minRaw = cleaned.substring(0, recIdx)
          recRaw = cleaned.substring(recIdx)
        } else {
          minRaw = cleaned
        }
      }
    }

    val minClean = cleanHtml(minRaw)
    val recClean = cleanHtml(recRaw)

    if (minClean.isBlank() && recClean.isBlank()) return null

    val minMap = extractSpecsFromBlock(minClean)
    val recMap = extractSpecsFromBlock(recClean)

    return PcRequirements(
      minimum = minClean.ifBlank { null },
      recommended = recClean.ifBlank { null },
      minOs = minMap["OS"],
      minCpu = minMap["Processor"],
      minRam = minMap["Memory"],
      minGpu = minMap["Graphics"],
      minVram = minMap["VRAM"],
      minDirectX = minMap["DirectX"],
      minStorage = minMap["Storage"],
      minNotes = minMap["Notes"],
      recOs = recMap["OS"],
      recCpu = recMap["Processor"],
      recRam = recMap["Memory"],
      recGpu = recMap["Graphics"],
      recVram = recMap["VRAM"],
      recStorage = recMap["Storage"],
      recDirectX = recMap["DirectX"],
      recNotes = recMap["Notes"]
    )
  }

  fun cleanHtml(html: String?): String {
    if (html.isNullOrBlank()) return ""
    return html
      .replace("\r\n", "\n")
      .replace("\r", "\n")
      .replace(Regex("(?i)<br\\s*/?>"), "\n")
      .replace(Regex("(?i)</p>"), "\n\n")
      .replace(Regex("(?i)</li>"), "\n")
      .replace(Regex("(?i)</div>"), "\n")
      .replace(Regex("(?i)<[^>]+>"), "")
      .replace("&nbsp;", " ")
      .replace("&amp;", "&")
      .replace("&quot;", "\"")
      .replace("&#39;", "'")
      .replace("&#x27;", "'")
      .replace("&lt;", "<")
      .replace("&gt;", ">")
      .lines()
      .map { it.trim() }
      .filter { it.isNotBlank() }
      .joinToString("\n")
      .trim()
  }

  private data class MarkerMatch(
    val category: String,
    val startIndex: Int,
    val matchLength: Int
  )

  fun extractSpecsFromBlock(rawBlock: String): Map<String, String> {
    if (rawBlock.isBlank()) return emptyMap()

    val block = rawBlock
      .replace(Regex("(?i)^\\s*(Minimum|Recommended):\\s*"), "")
      .trim()

    val foundMarkers = mutableListOf<MarkerMatch>()

    for ((category, synonyms) in MARKER_SYNONYMS) {
      for (syn in synonyms) {
        val regex = Regex("(?i)(?:^|\\n|;|\\b)\\s*${Regex.escape(syn)}\\s*:", RegexOption.IGNORE_CASE)
        val match = regex.find(block)
        if (match != null) {
          foundMarkers.add(
            MarkerMatch(
              category = category,
              startIndex = match.range.first,
              matchLength = match.value.length
            )
          )
          break
        }
      }
    }

    foundMarkers.sortBy { it.startIndex }

    val result = mutableMapOf<String, String>()

    for (i in foundMarkers.indices) {
      val current = foundMarkers[i]
      val valueStart = current.startIndex + current.matchLength
      val valueEnd = if (i + 1 < foundMarkers.size) {
        foundMarkers[i + 1].startIndex
      } else {
        block.length
      }

      if (valueStart < valueEnd && valueStart < block.length) {
        val rawValue = block.substring(valueStart, valueEnd.coerceAtMost(block.length))
        val cleanValue = cleanSpecValue(rawValue)
        if (cleanValue.isNotBlank()) {
          result[current.category] = cleanValue
        }
      }
    }

    return result
  }

  private fun cleanSpecValue(raw: String): String {
    return raw
      .replace(Regex("^\\s*:\\s*"), "")
      .replace(Regex("[;,\\s]+$"), "")
      .trim()
  }
}
